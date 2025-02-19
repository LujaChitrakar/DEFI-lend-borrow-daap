// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceOracle is Ownable {
    /**ERRORS */
    error PriceOracle__InvaidToken();
    error PriceOracle__InvaidCollateral();

    /**STATE VARIABLES */
    mapping(address => address) private s_priceFeeds;
    mapping(address => uint256) private s_collateralBalances;
    address private s_ethPriceFeed;

    /**EVENTS */
    event PriceFeedUpdated(
        address indexed tokenAddress,
        address indexed priceFeed
    );

    event collateralUpdated(address indexed user, uint256 amount);

    /** FUNCTIONS */
    constructor() Ownable(msg.sender) {}

    /**
     * @notice Adds or updates a price feed for a token.
     * @param tokenAddress The token address (e.g., ETH, BTC, USDT, USDC).
     * @param priceFeed The Chainlink price feed address.
     */
    function setPriceFeed(
        address tokenAddress,
        address priceFeed
    ) external onlyOwner {
        s_priceFeeds[tokenAddress] = priceFeed;
        emit PriceFeedUpdated(tokenAddress, priceFeed);
    }

    function setEthPriceFeed(address priceFeed) external onlyOwner {
        s_ethPriceFeed = priceFeed;
    }

    /**
     * @notice Returns the latest price of a token.
     * @param tokenAddress The token address.
     * @return The latest price in USD with 8 decimals.
     */
    function getLatestPrice(
        address tokenAddress
    ) public view returns (uint256) {
        // if (s_priceFeeds[tokenAddress] == address(0)) {
        //     revert PriceOracle__InvaidToken();
        // }

        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            s_priceFeeds[tokenAddress]
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price from oracle");
        return uint256(price) * 1e12;
    }

    function getEthLatestPrice() public view returns (uint256) {
        if (s_ethPriceFeed == address(0)) {
            revert PriceOracle__InvaidCollateral();
        }

        AggregatorV3Interface priceFeed = AggregatorV3Interface(s_ethPriceFeed);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid Eth price from oracle");
        return uint256(price);
    }

    /**
     * @notice Converts an amount of a token to its USD value.
     * @param tokenAddress The token address.
     * @param amount The amount of tokens (in smallest unit, e.g., wei).
     * @return The USD equivalent of the token amount (with 18 decimals).
     */
    function getTokenValueInUsd(
        address tokenAddress,
        uint256 amount
    ) public view returns (uint256) {
        uint256 price = getLatestPrice(tokenAddress);
        return (amount * price) / 1e18;
    }

    function getEthValueInUsd(uint256 amount) public view returns (uint256) {
        uint256 price = getEthLatestPrice();
        return (amount * price) / 1e18;
    }

    /**
    @notice updates users collateral balances
    @param user The address of the User
    @param amount The amount of collateral
      */
    function updateCollateral(address user, uint256 amount) external onlyOwner {
        s_collateralBalances[user] = amount;
        emit collateralUpdated(user, amount);
    }

    /**VIEW FUNCTION */
    function getPriceFeed(
        address tokenAddress
    ) external view returns (address) {
        return s_priceFeeds[tokenAddress];
    }

    function getCollateralValue(address user) external view returns (uint256) {
        uint256 totalCollateral = 0;
        uint256 balance = s_collateralBalances[user];
        if (balance > 0) {
            totalCollateral = getEthValueInUsd(balance);
        }
        return totalCollateral;
    }
}
