// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
// import {LendingToken} from "./LendingToken.sol";
import {InterestRateModel} from "./InterestRateModel.sol";
import {PriceOracle} from "./PriceOracle.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

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
    error DSCEngine__StablecoinBorrowFailed();
    using SafeERC20 for IERC20;

    /**STATE VARIABLES */

    address public constant USDC_ADDRESS =
        0x76eFc6B7aDac502DC210f255ea8420672C1355d3;

    InterestRateModel private immutable i_interest;
    PriceOracle private immutable i_priceOracle;

    mapping(address => uint256) s_stableCoinDeposit;
    mapping(address => uint256) s_collateralDeposit;
    mapping(address => uint256) s_debt;
    mapping(address => address) private s_priceFeed;
    mapping(address => uint256) s_tokenMinted;
    mapping(address => uint256) s_startTimestamp;

    uint256 private constant COLLATERAL_THRESHOLD = 150;
    uint256 private constant INTEREST_RATE = 5;
    uint256 private constant PRECISION = 1e18;
    uint256 public s_totalStablecoin;

    /**EVENTS */
    event CollateralDepositedAndBorrowed(
        address indexed user,
        uint256 collateralAmount,
        uint256 borrowedAmount
    );
    event StableCoinDeposited(address indexed from, uint256 amount);
    event CollateralDeposited(address indexed from, uint256 indexed amount);
    event StableCoinWithdrawed(address indexed from, uint256 indexed amount);
    event StablecoinBorrowed(address indexed from, uint256 indexed amount);
    event LoanRepaid(address indexed from, uint256 indexed amount);
    event tokenMinted(address indexed to, uint256 indexed amount);
    event CollateralWithdrawn(address indexed from, uint256 indexed amount);
    event Liquidation(
        address indexed liquidator,
        address indexed borrower,
        uint256 debtAmount,
        uint256 collateralSeized
    );

    /**MODIFIERS */
    modifier validStablecoin(address token) {
        if (token != USDC_ADDRESS) {
            revert DSCEngine__NotAllowedToken();
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
        require(s_stableCoinDeposit[user] >= amount, "Not sufficient deposit");
        _;
    }

    constructor(
        address priceOracleAddress,
        address InterestRateModelAddress
    ) Ownable(msg.sender) {
        i_priceOracle = PriceOracle(priceOracleAddress);
        i_interest = InterestRateModel(InterestRateModelAddress);
    }

    /**FOR LENDERS */

    function depositStablecoin(uint256 amountStableCoin) public {
        require(amountStableCoin > 0, "Amount must be greater than zero");

        // Use SafeERC20 to handle tokens that do not properly return a boolean
        IERC20 usdc = IERC20(USDC_ADDRESS);
        usdc.safeTransferFrom(msg.sender, address(this), amountStableCoin);

        // Update state
        s_stableCoinDeposit[msg.sender] += amountStableCoin;
        s_totalStablecoin += amountStableCoin;

        emit StableCoinDeposited(msg.sender, amountStableCoin); // Missing event for deposits
    }

    function withdrawStablecoin(uint256 amountStableCoin) public {
        require(amountStableCoin > 0, "Amount must be greater than zero");
        require(
            s_stableCoinDeposit[msg.sender] >= amountStableCoin,
            "Insufficient balance"
        );

        // Update state before external call
        s_stableCoinDeposit[msg.sender] -= amountStableCoin;
        s_totalStablecoin -= amountStableCoin;

        i_interest.resetInterest(msg.sender);

        // Use SafeERC20
        IERC20 usdc = IERC20(USDC_ADDRESS);
        usdc.safeTransfer(msg.sender, amountStableCoin);

        emit StableCoinWithdrawed(msg.sender, amountStableCoin);
    }

    // function burn(
    //     uint256 amountTokenToBurn
    // ) public moreThanZero(amountTokenToBurn) {
    //     _burn(msg.sender, msg.sender, amountTokenToBurn);
    // }

    /**FOR BORROWER */

    function depositCollateralAndBorrowStablecoin() public payable {
        require(msg.value > 0, "Collateral must be greater than zero");

        // First, deposit collateral
        depositCollateral();

        // Assume 1 ETH = 2000 USD for testing (Fixed value for simulation)
        uint256 ethToUsdRate = 2000 * 1e18;

        // Calculate collateral value in USD
        uint256 collateralValueInUsd = (msg.value * ethToUsdRate) / 1e18;

        // Borrow up to 50% of the collateral value to maintain a healthy ratio
        uint256 safeBorrowAmountInUsd = (collateralValueInUsd * 50) / 100;

        // Convert from 18 decimals to USDC's 6 decimals
        uint256 borrowAmountInUsdc = safeBorrowAmountInUsd / 1e12;

        // Ensure borrowing does not exceed available liquidity
        borrowAmountInUsdc = borrowAmountInUsdc > s_totalStablecoin
            ? s_totalStablecoin
            : borrowAmountInUsdc;

        // Set a minimum borrow amount to prevent dust loans
        uint256 minimumBorrowAmount = 1e3; // 0.001 USDC
        if (borrowAmountInUsdc >= minimumBorrowAmount) {
            borrowStablecoin(borrowAmountInUsdc);
        }

        emit CollateralDepositedAndBorrowed(
            msg.sender,
            msg.value,
            borrowAmountInUsdc
        );
    }

    function depositCollateral() public payable {
        // if (s_collateralDeposit[msg.sender] > 0) {
        //     i_interest.accureInterest(
        //         msg.sender,
        //         s_collateralDeposit[msg.sender],
        //         false
        //     );
        // }
        // if (s_startTimestamp[msg.sender] == 0) {
        //     s_startTimestamp[msg.sender] = block.timestamp;
        // }

        s_collateralDeposit[msg.sender] += msg.value;

        emit CollateralDeposited(msg.sender, msg.value);
    }

    function borrowStablecoin(uint256 stablecoinAmount) public {
        require(stablecoinAmount > 0, "Amount must be greater than zero");
        require(stablecoinAmount <= s_totalStablecoin, "Not enough liquidity");

        uint256 collateralValue = s_collateralDeposit[msg.sender];

        uint256 requiredCollateral = (stablecoinAmount * COLLATERAL_THRESHOLD) /
            100;
        require(
            requiredCollateral <= collateralValue,
            "Insufficient collateral"
        );

        s_debt[msg.sender] += stablecoinAmount;
        s_totalStablecoin -= stablecoinAmount;

        IERC20 usdc = IERC20(USDC_ADDRESS);
        usdc.safeTransfer(msg.sender, stablecoinAmount);

        emit StablecoinBorrowed(msg.sender, stablecoinAmount);
    }

    function repayLoan(
        uint256 stablecoinAmountToRepay // moreThanZero(stablecoinAmountToRepay)
        // nonReentrant
    ) public // validStablecoin(USDC_ADDRESS)
    {
        // i_interest.getAccuredInterest(msg.sender);
        // uint256 interestAccured = i_interest.getAccuredInterest(msg.sender);
        // uint256 principal = s_debt[msg.sender];
        // uint256 totalDebt = principal + interestAccured;

        // require(totalDebt > 0, "No outstanding debt");
        // require(
        //     stablecoinAmountToRepay >= totalDebt,
        //     "Repay amount exceeds debt"
        // );

        bool success = IERC20(USDC_ADDRESS).transferFrom(
            msg.sender,
            address(this),
            stablecoinAmountToRepay
        );
        if (!success) {
            revert DSCEngine__LoanRepaymentFailed();
        }
        s_debt[msg.sender] -= stablecoinAmountToRepay;
        s_totalStablecoin += stablecoinAmountToRepay;

        // if (s_debt[msg.sender] == 0) {
        //     i_interest.resetInterest(msg.sender);
        // }

        emit LoanRepaid(msg.sender, stablecoinAmountToRepay);
    }

    function withdrawCollateral(uint256 withdrawAmount) public {
        require(
            withdrawAmount > 0,
            "Withdraw amount must be greater than zero"
        );

        uint256 totalDeposit = s_collateralDeposit[msg.sender];
        require(
            totalDeposit >= withdrawAmount,
            "Insufficient collateral balance"
        );

        uint256 remainingCollateral = totalDeposit - withdrawAmount;

        uint256 debtValue = getDebtValue(msg.sender);
        uint256 collateralValue = getCollateralValue(remainingCollateral);
        require(
            getCollateralizationThresholdValid(collateralValue, debtValue),
            "Collateral threshold breached"
        );

        s_collateralDeposit[msg.sender] = remainingCollateral;

        (bool success, ) = payable(msg.sender).call{value: withdrawAmount}("");
        if (!success) {
            revert DSCEngine__TransferFailed();
        }

        emit CollateralWithdrawn(msg.sender, withdrawAmount);
    }

    // function liquidate(
    //     address _borrower,
    //     uint256 repayAmount
    // )
    //     external
    //     nonReentrant
    //     validStablecoin(USDC_ADDRESS)
    //     moreThanZero(repayAmount)
    // {
    //     require(s_debt[_borrower] > 0, "Borrower has no debt");

    //     require(
    //         repayAmount > 0 && repayAmount <= s_debt[_borrower],
    //         "Invalid repay amount"
    //     );

    //     uint256 seizeAmountInEth = _calculateLiquidationAmount(
    //         _borrower,
    //         repayAmount
    //     );

    //     _executeLiquidation(_borrower, repayAmount, seizeAmountInEth);

    //     emit Liquidation(msg.sender, _borrower, repayAmount, seizeAmountInEth);
    // }

    /**VIEW FUNCTIONS */
    // function getTotalBalanceInContract() public view returns (uint256) {
    //     address(this).balance;
    // }

    function getStableCoinBalance(
        address user
    ) external view returns (uint256) {
        return s_stableCoinDeposit[user];
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

    /**FUNCTIONS(PRIVATE and INTERNAL) */

    // function _calculateLiquidationAmount(
    //     address _borrower,
    //     uint256 repayAmount
    // ) internal view returns (uint256 seizeAmountInEth) {
    //     uint256 liquidationBonus = 10;
    //     uint256 repayAmountInUsd = i_priceOracle.getTokenValueInUsd(
    //         USDC_ADDRESS,
    //         repayAmount
    //     );
    //     uint256 seizeAmountInUsd = (repayAmountInUsd *
    //         (100 + liquidationBonus)) / 100;

    //     uint256 ethPricePerUnit = i_priceOracle.getEthLatestPrice();
    //     seizeAmountInEth = (seizeAmountInUsd * 1e18) / ethPricePerUnit;

    //     require(
    //         seizeAmountInUsd <= s_collateralDeposit[_borrower],
    //         "Not enough collateral to seize"
    //     );
    //     return (seizeAmountInEth);
    // }

    // function _isUserUnderCollaterized(
    //     address user
    // ) internal view returns (bool) {
    //     uint256 totalCollateralValue = getAccountCollateralValueInUSD(user);
    //     uint256 totalDebt = getTotalDebtOfAccount(user);
    //     if (totalDebt == 0) return false;
    //     uint256 healthFactor = (totalCollateralValue *
    //         PRECISION *
    //         COLLATERAL_THRESHOLD) / (totalDebt * 100);
    //     return healthFactor < PRECISION;
    // }

    // function _executeLiquidation(
    //     address _borrower,
    //     uint256 repayAmount,
    //     uint256 seizeAmountInEth
    // ) internal {
    //     require(
    //         _isUserUnderCollaterized(_borrower),
    //         "User is not undercollaterized"
    //     );

    //     require(
    //         seizeAmountInEth <= s_collateralDeposit[_borrower],
    //         "Not Enough collateral"
    //     );
    //     i_interest.accureInterest(_borrower, s_debt[_borrower], false);

    //     bool success = IERC20(USDC_ADDRESS).transferFrom(
    //         msg.sender,
    //         address(this),
    //         repayAmount
    //     );
    //     if (!success) {
    //         revert DSCEngine__LiquidationFailed();
    //     }

    //     s_debt[_borrower] -= repayAmount;
    //     s_collateralDeposit[_borrower] -= seizeAmountInEth;
    //     s_totalStablecoin += repayAmount;

    //     if (s_debt[_borrower] == 0) {
    //         i_interest.resetInterest(_borrower);
    //     }

    //     (bool ethTransferSuccess, ) = payable(msg.sender).call{
    //         value: seizeAmountInEth
    //     }("");
    //     if (!ethTransferSuccess) {
    //         revert DSCEngine__LiquidationFailed();
    //     }
    // }

    function getDebtValue(address user) internal view returns (uint256) {
        uint256 totalDebt = s_debt[user];
        return i_priceOracle.getTokenValueInUsd(USDC_ADDRESS, totalDebt);
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
        uint256 usdcDebtBalance = s_debt[user];

        uint256 usdcPrice = i_priceOracle.getLatestPrice(USDC_ADDRESS);

        uint256 usdcValue = (usdcDebtBalance * usdcPrice) / 1e18;

        return usdcValue;
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

    function getDebtBalance(address user) external view returns (uint256) {
        return s_debt[user];
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

    // function isCollateralValid(
    //     address collateral
    // ) external view returns (bool) {
    //     return collateral == WBTC_ADDRESS || collateral == WETH_ADDRESS;
    // }

    function isStablecoinValid(
        address stablecoin
    ) external pure returns (bool) {
        return stablecoin == USDC_ADDRESS;
    }

    function canUserBeLiquidated(address user) external view returns (bool) {
        uint256 healthFactor = this.getHealthFactor(user);
        return healthFactor < PRECISION;
    }

    /**FOR FRONTEND */
    function getTotalStablecoinInPool() external view returns (uint256) {
        return s_totalStablecoin;
    }

    function getYourBorrowedStablecoin() external view returns (uint256) {
        return s_debt[msg.sender];
    }

    function getYourCollateralDeposited() external view returns (uint256) {
        return s_collateralDeposit[msg.sender];
    }

    function getYourLendedStablecoin() external view returns (uint256) {
        return s_stableCoinDeposit[msg.sender];
    }

    function getUSDCPrice() external view returns (uint256) {
        return i_priceOracle.getLatestPrice(USDC_ADDRESS);
    }

    function getETHPrice() external view returns (uint256) {
        return i_priceOracle.getEthLatestPrice();
    }

    function getYourCollateralValueInUSD() external view returns (uint256) {
        return getAccountCollateralValueInUSD(msg.sender);
    }

    function getYourDebtValueInUSD() external view returns (uint256) {
        return getTotalDebtOfAccount(msg.sender);
    }

    function getMaxBorrowableAmount() external view returns (uint256) {
        uint256 collateralValueInUSD = getAccountCollateralValueInUSD(
            msg.sender
        );
        uint256 maxDebtValueInUSD = (collateralValueInUSD * 100) /
            COLLATERAL_THRESHOLD;
        uint256 currentDebtValueInUSD = getTotalDebtOfAccount(msg.sender);

        if (currentDebtValueInUSD >= maxDebtValueInUSD) {
            return 0;
        }

        uint256 remainingBorrowableValueInUSD = maxDebtValueInUSD -
            currentDebtValueInUSD;
        uint256 usdcPrice = i_priceOracle.getLatestPrice(USDC_ADDRESS);
        uint256 maxBorrowableUSDC = (remainingBorrowableValueInUSD * 1e18) /
            usdcPrice;

        return
            maxBorrowableUSDC > s_totalStablecoin
                ? s_totalStablecoin
                : maxBorrowableUSDC;
    }

    function getMaxWithdrawableCollateral() external view returns (uint256) {
        uint256 debtValueInUSD = getTotalDebtOfAccount(msg.sender);

        if (debtValueInUSD == 0) {
            return s_collateralDeposit[msg.sender];
        }

        uint256 requiredCollateralValueInUSD = (debtValueInUSD *
            COLLATERAL_THRESHOLD) / 100;
        uint256 currentCollateralValueInUSD = getAccountCollateralValueInUSD(
            msg.sender
        );

        if (currentCollateralValueInUSD <= requiredCollateralValueInUSD) {
            return 0;
        }

        uint256 excessCollateralValueInUSD = currentCollateralValueInUSD -
            requiredCollateralValueInUSD;
        uint256 ethPrice = i_priceOracle.getEthLatestPrice();
        uint256 withdrawableCollateralInETH = (excessCollateralValueInUSD *
            1e18) / ethPrice;

        return
            withdrawableCollateralInETH > s_collateralDeposit[msg.sender]
                ? s_collateralDeposit[msg.sender]
                : withdrawableCollateralInETH;
    }

    /**
     * @notice Returns the amount of interest accrued on the caller's debt
     * @return Interest amount in stablecoin units
     */
    function getYourAccruedDebtInterest() external view returns (uint256) {
        return i_interest.getAccuredInterest(msg.sender);
    }

    /**
     * @notice Returns the amount of interest earned by the caller as a lender
     * @return Interest amount in stablecoin units
     */
    function getYourEarnedLendingInterest() external view returns (uint256) {
        return i_interest.getAccuredInterest(msg.sender);
    }

    function getYourHealthFactor() external view returns (uint256) {
        uint256 totalCollateralValueInUsd = getAccountCollateralValueInUSD(
            msg.sender
        );
        uint256 totalDebtInUsd = getTotalDebtOfAccount(msg.sender);

        if (totalDebtInUsd == 0) return type(uint256).max;

        return
            (totalCollateralValueInUsd * PRECISION * COLLATERAL_THRESHOLD) /
            (totalDebtInUsd * 100);
    }
}
