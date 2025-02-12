// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import {LendingToken} from "./LendingToken.sol";
import {InterestRateModel} from "./InterestRateModel.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
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

    /**STATE VARIABLES */
    mapping(address => mapping(address => uint256)) s_stableCoinDeposit;
    mapping(address => mapping(address => uint256)) s_collateralDeposit;
    mapping(address => address) private s_priceFeed;
    mapping(address => uint256) s_tokenMinted;
    mapping(address => uint256) s_startTimestamp;

    LendingToken private immutable i_ltoken;
    InterestRateModel private immutable i_interest;
    address public immutable USDT_ADDRESS;
    address public immutable USDC_ADDRESS;
    uint256 private constant ADDITIONAL_FEED_PRECISION = 1e10;
    uint256 private constant PRECISION = 1e18;

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
    modifier isTokenAllowed(address token) {
        if (s_priceFeed[token] == address(0)) {
            revert DSCEngine__NotAllowedToken();
        }
        _;
    }
    modifier isCollateralAllowed(address collateral) {
        if (s_priceFeed[collateral] == address(0)) {
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
        address[] memory StableCoinAddresses,
        address[] memory priceFeedAddresses,
        address dsctokenAddress,
        address _usdtAddress,
        address _usdcAddress,
        address InterestRateModelAddress
    ) Ownable(msg.sender) {
        if (StableCoinAddresses.length != priceFeedAddresses.length) {
            revert();
        }
        for (uint256 i = 0; i < StableCoinAddresses.length; i++) {
            s_priceFeed[StableCoinAddresses[i]] = priceFeedAddresses[i];
        }
        i_ltoken = LendingToken(dsctokenAddress);
        i_interest = InterestRateModel(InterestRateModelAddress);
        USDT_ADDRESS = _usdtAddress;
        USDC_ADDRESS = _usdcAddress;
    }

    /**FOR LENDERS */

    function depositStableCoinsAndMintToken(
        address tokenAddress,
        uint256 amountStableCoin
    ) external {
        depositStableCoins(tokenAddress, amountStableCoin);
        mintLendingToken(amountStableCoin);
    }

    function withdrawStableCoinsAndBurnToken(
        address tokenAddress,
        uint256 amountStableCoin,
        uint256 amountTokenToBurn
    ) external {
        withdrawStableCoin(tokenAddress, amountStableCoin);
        burn(amountTokenToBurn);
    }

    function depositStableCoins(
        address tokenAddress,
        uint256 amountStableCoin
    )
        public
        isTokenAllowed(tokenAddress)
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
        isTokenAllowed(tokenAddress)
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
        isCollateralAllowed(collateralAddress)
    {
        i_interest.accureInterest(
            msg.sender,
            s_stableCoinDeposit[msg.sender][collateralAddress],
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

    /**ADMIN FUNCTIONS */
    function addAllowedToken(
        address token,
        address priceFeed
    ) external onlyOwner {
        s_priceFeed[token] = priceFeed;
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

    function _getTokenAmountFromUsd(
        address tokenAddress,
        uint256 usdAmountInWei
    ) public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            s_priceFeed[tokenAddress]
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();

        return
            (usdAmountInWei * PRECISION) /
            (uint256(price) * ADDITIONAL_FEED_PRECISION);
    }
}
