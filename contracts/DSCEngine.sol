// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import {LendingToken} from "./LendingToken.sol";
import {InterestRateModel} from "./InterestRateModel.sol";
import {PriceOracle} from "./PriceOracle.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract DSCEngine is ReentrancyGuard, Ownable {
    /**ERRORS */
    error DSCEngine__TransferFailed();
    error DSCEngine__NotAllowedToken();
    error DSCEngine__NotAllowedCollateral();
    error DSCEngine__NeedsMoreThanZero();
    error DSCEngine__Mintfailed();
    error DSCEngine__TokenBurnFailed();
    error DSCEngine__WithdrawCollateralFailed();
    error DSCEngine__TokenToMintExceedsDepositedStablecoin();
    error DSCEngine__LoanRepaymentFailed();
    error DSCEngine__LiquidationFailed();

    /**STATE VARIABLES */

    address public immutable USDC_ADDRESS;
    address public immutable USDT_ADDRESS;
    address public immutable WETH_ADDRESS;
    address public immutable WBTC_ADDRESS;
    LendingToken private immutable i_ltoken;
    InterestRateModel private immutable i_interest;
    PriceOracle private immutable i_priceOracle;

    mapping(address => mapping(address => uint256)) s_stableCoinDeposit;
    mapping(address => uint256) s_collateralDeposit;
    mapping(address => mapping(address => uint256)) s_debt;
    mapping(address => address) private s_priceFeed;
    mapping(address => uint256) s_tokenMinted;
    mapping(address => uint256) s_startTimestamp;

    uint256 private constant COLLATERAL_THRESHOLD = 150;
    uint256 private constant INTEREST_RATE = 5;
    uint256 private constant PRECISION = 1e18;
    uint256 public s_totalStablecoin;

    /**EVENTS */
    event StableCoinDeposited(
        address indexed from,
        address indexed token,
        uint256 amount
    );
    event CollateralDeposited(address indexed from, uint256 indexed amount);
    event StableCoinWithdrawed(
        address indexed from,
        address indexed token,
        uint256 indexed amount
    );
    event tokenMinted(address indexed to, uint256 indexed amount);
    event Liquidation(
        address indexed liquidator,
        address indexed borrower,
        address indexed debtToken,
        uint256 debtAmount,
        uint256 collateralSeized
    );

    /**MODIFIERS */
    modifier validStablecoin(address token) {
        if (token != USDC_ADDRESS && token != USDT_ADDRESS) {
            revert DSCEngine__NotAllowedToken();
        }
        _;
    }
    modifier validCollateral(address collateral) {
        if (collateral != WBTC_ADDRESS && collateral != WETH_ADDRESS) {
            revert DSCEngine__NotAllowedCollateral();
        }
        _;
    }
    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert DSCEngine__NeedsMoreThanZero();
        }
        _;
    }

    modifier sufficientDeposit(address user, uint256 amount) {
        require(
            s_stableCoinDeposit[user][USDC_ADDRESS] >= amount,
            "Not sufficient deposit"
        );
        require(
            s_stableCoinDeposit[user][USDT_ADDRESS] >= amount,
            "Not sufficient deposit"
        );
        _;
    }

    constructor(
        address priceOracleAddress,
        address dsctokenAddress,
        address InterestRateModelAddress,
        address usdcAddress,
        address usdtAddress,
        address wethAddress,
        address wbtcAddress
    ) Ownable(msg.sender) {
        i_priceOracle = PriceOracle(priceOracleAddress);
        i_ltoken = LendingToken(dsctokenAddress);
        i_interest = InterestRateModel(InterestRateModelAddress);
        USDC_ADDRESS = usdcAddress;
        USDT_ADDRESS = usdtAddress;
        WETH_ADDRESS = wethAddress;
        WBTC_ADDRESS = wbtcAddress;
    }

    /**FOR LENDERS */

    function depositStableCoinsAndMintToken(
        address tokenAddress,
        uint256 amountStableCoin
    )
        external
        validStablecoin(tokenAddress)
        moreThanZero(amountStableCoin)
        nonReentrant
    {
        depositStableCoins(tokenAddress, amountStableCoin);
        mintLendingToken(amountStableCoin);
    }

    function withdrawStableCoinsAndBurnToken(
        address tokenAddress,
        uint256 amountStableCoin,
        uint256 amountTokenToBurn
    )
        external
        validStablecoin(tokenAddress)
        moreThanZero(amountStableCoin)
        nonReentrant
    {
        withdrawStableCoin(tokenAddress, amountStableCoin);
        burn(amountTokenToBurn);
    }

    function depositStableCoins(
        address tokenAddress,
        uint256 amountStableCoin
    )
        public
        validStablecoin(tokenAddress)
        moreThanZero(amountStableCoin)
        nonReentrant
    {
        i_interest.accureInterest(
            msg.sender,
            s_stableCoinDeposit[msg.sender][tokenAddress],
            true
        );
        bool success = IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            amountStableCoin
        );
        if (!success) {
            revert DSCEngine__TransferFailed();
        }
        s_stableCoinDeposit[msg.sender][tokenAddress] += amountStableCoin;
        s_totalStablecoin += amountStableCoin;
        emit StableCoinDeposited(msg.sender, tokenAddress, amountStableCoin);
    }

    function mintLendingToken(
        uint256 amountTokenToMint
    )
        public
        moreThanZero(amountTokenToMint)
        nonReentrant
        sufficientDeposit(msg.sender, amountTokenToMint)
    {
        require(address(i_ltoken) != address(0), "i_ltoken not initialized");
        uint256 depositedStablecoin = s_stableCoinDeposit[msg.sender][
            USDT_ADDRESS
        ] + s_stableCoinDeposit[msg.sender][USDC_ADDRESS];

        if (depositedStablecoin < amountTokenToMint) {
            revert DSCEngine__TokenToMintExceedsDepositedStablecoin();
        }

        s_tokenMinted[msg.sender] += amountTokenToMint;
        emit tokenMinted(msg.sender, amountTokenToMint);
        bool minted = i_ltoken.mint(msg.sender, amountTokenToMint);
        if (!minted) {
            revert DSCEngine__Mintfailed();
        }
    }

    function withdrawStableCoin(
        address tokenAddress,
        uint256 amountStableCoin
    )
        public
        validStablecoin(tokenAddress)
        moreThanZero(amountStableCoin)
        nonReentrant
    {
        i_interest.accureInterest(
            msg.sender,
            s_stableCoinDeposit[msg.sender][tokenAddress],
            true
        );

        uint256 accuredInterest = i_interest.getAccuredInterest(msg.sender);

        bool success = IERC20(tokenAddress).transfer(
            msg.sender,
            amountStableCoin + accuredInterest
        );
        if (!success) {
            revert DSCEngine__TransferFailed();
        }

        s_stableCoinDeposit[msg.sender][tokenAddress] -= amountStableCoin;
        i_interest.resetInterest(msg.sender);
        s_totalStablecoin -= amountStableCoin;
        emit StableCoinWithdrawed(msg.sender, tokenAddress, amountStableCoin);
    }

    function burn(
        uint256 amountTokenToBurn
    ) public moreThanZero(amountTokenToBurn) {
        _burn(msg.sender, msg.sender, amountTokenToBurn);
    }

    /**FOR BORROWER */


    function depositCollateralAndBorrowStablecoin(
        address tokenAddress
    )
        public
        payable
        moreThanZero(msg.value)
        nonReentrant
    // validCollateral(collateralAddress)
    {
        depositCollateral();
        borrowStableCoins(tokenAddress, msg.value);
    }

    function depositCollateral()
        public
        payable
        moreThanZero(msg.value)
        nonReentrant
    // validCollateral(collateralAddress)
    {
        i_interest.accureInterest(
            msg.sender,
            s_collateralDeposit[msg.sender],
            false
        );

        s_collateralDeposit[msg.sender] += msg.value;

        emit CollateralDeposited(msg.sender, msg.value);
    }

    function borrowStableCoins(
        address tokenAddress,
        uint256 stableCoinAmount
    )
        public
        moreThanZero(stableCoinAmount)
        nonReentrant
        validStablecoin(tokenAddress)
    {
        i_interest.accureInterest(
            msg.sender,
            s_debt[msg.sender][tokenAddress],
            false
        );

        uint256 collateralValue = i_priceOracle.getCollateralValue(msg.sender);

        uint256 requiredCollateral = (stableCoinAmount * COLLATERAL_THRESHOLD) /
            100;
        require(requiredCollateral <= collateralValue, "Not enough collateral");

        s_debt[msg.sender][tokenAddress] += stableCoinAmount;

        bool success = IERC20(tokenAddress).transfer(
            msg.sender,
            stableCoinAmount
        );
        if (!success) {
            revert();
        }
        s_totalStablecoin -= stableCoinAmount;
    }

    function repayLoan(
        address tokenAddress,
        uint256 stablecoinAmountToRepay
    )
        public
        moreThanZero(stablecoinAmountToRepay)
        nonReentrant
        validStablecoin(tokenAddress)
    {
        require(
            s_debt[msg.sender][tokenAddress] >= stablecoinAmountToRepay,
            "Repay amount exceeds debt"
        );
        uint256 interestAccured = i_interest.getAccuredInterest(msg.sender);
        uint256 principal = s_debt[msg.sender][tokenAddress];
        require(principal + interestAccured > 0, "No outstanding debt");

        i_interest.accureInterest(
            msg.sender,
            s_debt[msg.sender][tokenAddress],
            false
        );
        s_debt[msg.sender][tokenAddress] -= stablecoinAmountToRepay;

        s_totalStablecoin += stablecoinAmountToRepay;
        bool success = IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            stablecoinAmountToRepay
        );
        if (!success) {
            revert DSCEngine__LoanRepaymentFailed();
        }
    }

    function withdrawCollateral(
        address tokenAddress,
        uint256 amountToWithdraw
    ) public moreThanZero(amountToWithdraw) nonReentrant {
        uint256 totalDeposit = s_collateralDeposit[msg.sender];
        require(
            totalDeposit >= amountToWithdraw,
            " Amount exceeds total collateral deposited"
        );

        uint256 newCollateral = totalDeposit - amountToWithdraw;

        uint256 debtValue = getDebtValue(msg.sender, tokenAddress);
        uint256 collateralValue = getCollateralValue(newCollateral);
        payable(msg.sender).transfer(amountToWithdraw);

        require(
            getCollateralizationThresholdValid(collateralValue, debtValue),
            "Collateral threshold breached"
        );

        s_collateralDeposit[msg.sender] = newCollateral;
    }

    function liquidate(
        address _borrower,
        address tokenAddress,
        uint256 repayAmount
    )
        external
        nonReentrant
        validStablecoin(tokenAddress)
        moreThanZero(repayAmount)
    {
        require(s_debt[_borrower][tokenAddress] > 0, "Borrower has no debt");
        uint256 totalCollateralValue = getAccountCollateralValueInUSD(
            _borrower
        );

        uint256 totalDebt = getTotalDebtOfAccount(_borrower);
        uint256 healthFactor = ((totalCollateralValue * COLLATERAL_THRESHOLD) /
            totalDebt) / 1e18;

        require(healthFactor < PRECISION, "User is undercollaterized");
        require(
            repayAmount > 0 && repayAmount <= s_debt[_borrower][tokenAddress],
            "Invalid repay amount"
        );

        uint256 liquidationBonus = 10;
        uint256 repayAmountInUsd = i_priceOracle.getTokenValueInUsd(
            tokenAddress,
            repayAmount
        );
        uint256 seizeAmountInUsd = (repayAmountInUsd *
            (100 + liquidationBonus)) / 100;

        uint256 ethPricePerUnit = i_priceOracle.getEthLatestPrice();
        uint256 seizeAmountInEth = (seizeAmountInUsd * 1e18) / ethPricePerUnit;

        require(
            seizeAmountInUsd <= s_collateralDeposit[_borrower],
            "Not enough collateral to seize"
        );
        bool success = IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            repayAmount
        );
        if (!success) {
            revert DSCEngine__LiquidationFailed();
        }

        s_debt[_borrower][tokenAddress] -= repayAmount;
        s_collateralDeposit[_borrower] -= seizeAmountInEth;

        (bool ethTransferSuccess, ) = payable(msg.sender).call{
            value: seizeAmountInEth
        }("");
        if (!ethTransferSuccess) {
            revert DSCEngine__LiquidationFailed();
        }
        i_priceOracle.updateCollateral(
            _borrower,
            s_collateralDeposit[_borrower]
        );

        emit Liquidation(
            msg.sender,
            _borrower,
            tokenAddress,
            repayAmount,
            seizeAmountInEth
        );
    }

    /**VIEW FUNCTIONS */
    function getStableCoinBalance(
        address user,
        address token
    ) external view returns (uint256) {
        return s_stableCoinDeposit[user][token];
    }

    function getMintedLendingToken(
        address user
    ) external view returns (uint256) {
        return s_tokenMinted[user];
    }

    function totalTimePassed(address user) external view returns (uint256) {
        require(s_startTimestamp[user] > 0, "User has not deposited yet");
        return (block.timestamp - s_startTimestamp[user]);
    }

    /**FUNCTIONS(PRIVATE and INTERNAL) */

    /**
     @param onBehalfOf : The address of the user whose token is to be burned.
     @param tokenFrom : The address of the user whose stablecoin is to be set into mining Pool.
     @param amountTokenToBurn : The amount of token you want to burn to improve the users health factor
    */
    function _burn(
        address onBehalfOf,
        address tokenFrom,
        uint256 amountTokenToBurn
    ) private {
        s_tokenMinted[onBehalfOf] -= amountTokenToBurn;

        bool burned = i_ltoken.transferFrom(
            tokenFrom,
            address(this),
            amountTokenToBurn
        );
        if (!burned) {
            revert DSCEngine__TokenBurnFailed();
        }
        i_ltoken.burn(amountTokenToBurn);
    }

    function getDebtValue(
        address user,
        address tokenAddress
    ) internal view returns (uint256) {
        uint256 totalDebt = s_debt[user][tokenAddress];
        return i_priceOracle.getTokenValueInUsd(tokenAddress, totalDebt);
    }

    function getCollateralValue(
        uint256 collateralAmount
    ) internal view returns (uint256) {
        return i_priceOracle.getEthValueInUsd(collateralAmount);
    }

    function getAccountCollateralValueInUSD(
        address user
    ) internal view returns (uint256) {
        uint256 ethBalance = s_collateralDeposit[user];

        uint256 ethPrice = i_priceOracle.getEthLatestPrice();

        uint256 ethValue = (ethBalance * ethPrice) / 1e18;

        return ethValue;
    }

    function getTotalDebtOfAccount(
        address user
    ) internal view returns (uint256) {
        uint256 usdcDebtBalance = s_debt[user][USDC_ADDRESS];
        uint256 usdtDebtBalance = s_debt[user][USDT_ADDRESS];

        uint256 usdcPrice = i_priceOracle.getLatestPrice(USDC_ADDRESS);
        uint256 usdtPrice = i_priceOracle.getLatestPrice(USDT_ADDRESS);

        uint256 usdcValue = (usdcDebtBalance * usdcPrice) / 1e18;
        uint256 usdtValue = (usdtDebtBalance * usdtPrice) / 1e18;

        return usdcValue + usdtValue;
    }

    function getCollateralizationThresholdValid(
        uint256 collateralValue,
        uint256 debtValue
    ) internal pure returns (bool) {
        if (debtValue == 0) {
            return true;
        }
        uint256 collateralRatio = (collateralValue * 100) / debtValue;
        return collateralRatio >= COLLATERAL_THRESHOLD;
    }

    function getCollateralDepositBalance(
        address user
    ) external view returns (uint256) {
        return s_collateralDeposit[user];
    }

    function getDebtBalance(
        address user,
        address tokenAddress
    ) external view returns (uint256) {
        return s_debt[user][tokenAddress];
    }

    function getTotalStablecoinSupply() external view returns (uint256) {
        return s_totalStablecoin;
    }

    function getHealthFactor(address user) external view returns (uint256) {
        uint256 totalCollateralValueInUsd = getAccountCollateralValueInUSD(
            user
        );
        uint256 totalDebtInUsd = getTotalDebtOfAccount(user);

        if (totalDebtInUsd == 0) return type(uint256).max;

        return
            (totalCollateralValueInUsd * PRECISION * COLLATERAL_THRESHOLD) /
            (totalDebtInUsd * 100);
    }

    function getUserCollateralValueInUsd(
        address user
    ) external view returns (uint256) {
        return getAccountCollateralValueInUSD(user);
    }

    function getUserTotalDebtInUsd(
        address user
    ) external view returns (uint256) {
        return getTotalDebtOfAccount(user);
    }

    function getTokenPriceInUsd(
        address tokenAddress
    ) external view returns (uint256) {
        return i_priceOracle.getLatestPrice(tokenAddress);
    }

    function getAccuredInterest(address user) external view returns (uint256) {
        return i_interest.getAccuredInterest(user);
    }

    function getCollateralThreshold() external pure returns (uint256) {
        return COLLATERAL_THRESHOLD;
    }

    function getInterest() external pure returns (uint256) {
        return INTEREST_RATE;
    }

    function isCollateralValid(
        address collateral
    ) external view returns (bool) {
        return collateral == WBTC_ADDRESS || collateral == WETH_ADDRESS;
    }

    function isStablecoinValid(
        address stablecoin
    ) external view returns (bool) {
        return stablecoin == USDC_ADDRESS || stablecoin == USDT_ADDRESS;
    }

    function canUserBeLiquidated(address user) external view returns (bool) {
        uint256 healthFactor = this.getHealthFactor(user);
        return healthFactor < PRECISION;
    }
}
