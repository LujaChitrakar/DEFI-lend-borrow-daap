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

    /**STATE VARIABLES */

    address public constant USDC_ADDRESS =
        0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public constant USDT_ADDRESS =
        0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address public constant WETH_ADDRESS =
        0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant WBTC_ADDRESS =
        0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;
    mapping(address => mapping(address => uint256)) s_stableCoinDeposit;
    mapping(address => mapping(address => uint256)) s_collateralDeposit;
    mapping(address => mapping(address => uint256)) s_debt;
    mapping(address => address) private s_priceFeed;
    mapping(address => uint256) s_tokenMinted;
    mapping(address => uint256) s_startTimestamp;

    LendingToken private immutable i_ltoken;
    InterestRateModel private immutable i_interest;
    PriceOracle private immutable i_priceOracle;
    // IERC20 private immutable stablecoin;

    uint256 private constant COLLATERAL_THRESHOLD = 150;
    uint256 private constant INTEREST_RATE = 5;
    // uint256 private constant ADDITIONAL_FEED_PRECISION = 1e10;
    uint256 private constant PRECISION = 1e18;
    uint256 public s_totalStablecoin;

    /**EVENTS */
    event StableCoinDeposited(
        address indexed from,
        address indexed token,
        uint256 amount
    );
    event CollateralDeposited(
        address indexed from,
        address indexed collateral,
        uint256 indexed amount
    );
    event StableCoinWithdrawed(
        address indexed from,
        address indexed token,
        uint256 indexed amount
    );
    event tokenMinted(address indexed to, uint256 indexed amount);

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
            s_collateralDeposit[user][USDC_ADDRESS] >= amount,
            "Not sufficient deposit"
        );
        require(
            s_collateralDeposit[user][USDT_ADDRESS] >= amount,
            "Not sufficient deposit"
        );
        _;
    }

    constructor(
        address priceOracleAddress,
        address dsctokenAddress,
        address InterestRateModelAddress
    ) Ownable(msg.sender) {
        i_ltoken = LendingToken(dsctokenAddress);
        i_interest = InterestRateModel(InterestRateModelAddress);
        i_priceOracle = PriceOracle(priceOracleAddress);
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
        ] + s_stableCoinDeposit[msg.sender][USDT_ADDRESS];

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
    function depositCollateral(
        address collateralAddress,
        uint256 collateralAmount
    )
        public
        moreThanZero(collateralAmount)
        nonReentrant
        validCollateral(collateralAddress)
    {
        i_interest.accureInterest(
            msg.sender,
            s_collateralDeposit[msg.sender][collateralAddress],
            false
        );
        bool success = IERC20(collateralAddress).transferFrom(
            msg.sender,
            address(this),
            collateralAmount
        );
        if (!success) {
            revert DSCEngine__TransferFailed();
        }
        s_collateralDeposit[msg.sender][collateralAddress] += collateralAmount;

        emit CollateralDeposited(
            msg.sender,
            collateralAddress,
            collateralAmount
        );
    }

    function borrowStableCoins(
        address tokenAddress,
        uint256 stableCoinAmount,
        address collateralAddress
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

        uint256 collateralValue = i_priceOracle.getCollateralValue(
            msg.sender,
            collateralAddress
        );

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
        address collateralAddress,
        uint256 amountToWithdraw
    )
        public
        moreThanZero(amountToWithdraw)
        nonReentrant
        validCollateral(collateralAddress)
    {
        uint256 totalDeposit = s_collateralDeposit[msg.sender][
            collateralAddress
        ];
        require(
            totalDeposit >= amountToWithdraw,
            " Amount exceeds total collateral deposited"
        );

        uint256 newCollateral = totalDeposit - amountToWithdraw;

        uint256 debtValue = getDebtValue(msg.sender, collateralAddress);
        uint256 collateralValue = getCollateralValue(
            collateralAddress,
            newCollateral
        );

        require(
            getCollateralizationThresholdValid(collateralValue, debtValue),
            "Collateral threshold breached"
        );

        s_collateralDeposit[msg.sender][collateralAddress] = newCollateral;

        bool success = IERC20(collateralAddress).transfer(
            msg.sender,
            amountToWithdraw
        );

        if (!success) {
            revert DSCEngine__WithdrawCollateralFailed();
        }
    }

    function liquidate(
        address _borrower,
        address tokenAddress,
        uint256 repayAmount
    ) external nonReentrant {
        uint256 totalCollateralValue = getAccountCollateralValueInUSD(
            _borrower
        );

        uint256 totalDebt = getTotalDebtOfAccount(_borrower);
        uint256 healthFactor = ((totalCollateralValue * COLLATERAL_THRESHOLD) /
            totalDebt) / 1e18;

        require(healthFactor < 1, "User is undercollaterized");
        require(
            repayAmount > 0 && repayAmount <= totalDebt,
            "Invalid repay amount"
        );

        uint256 liquidationBonus = 10;
        uint256 seizeAmount = ((liquidationBonus + 100) * repayAmount) / 100;
        require(
            seizeAmount <= s_collateralDeposit[_borrower][tokenAddress],
            "Not enough collateral to seize"
        );
        s_debt[_borrower][tokenAddress] -= repayAmount;
        s_collateralDeposit[_borrower][tokenAddress] -= seizeAmount;

        bool success1 = IERC20(tokenAddress).transfer(msg.sender, seizeAmount);
        bool success2 = IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            repayAmount
        );
        if (!success1 && !success2) {
            revert();
        }
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
        address collateralAddress,
        uint256 collateralAmount
    ) internal view returns (uint256) {
        return
            i_priceOracle.getTokenValueInUsd(
                collateralAddress,
                collateralAmount
            );
    }

    function getAccountCollateralValueInUSD(
        address user
    ) internal view returns (uint256) {
        uint256 wethBalance = s_collateralDeposit[user][WETH_ADDRESS];
        uint256 wbtcBalance = s_collateralDeposit[user][WBTC_ADDRESS];

        uint256 wethPrice = i_priceOracle.getLatestPrice(WETH_ADDRESS);
        uint256 wbtcPrice = i_priceOracle.getLatestPrice(WBTC_ADDRESS);

        uint256 wethValue = (wethBalance * wethPrice) / 1e18;
        uint256 wbtcValue = (wbtcBalance * wbtcPrice) / 1e18;

        return wethValue + wbtcValue;
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
}
