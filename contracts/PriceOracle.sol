// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract PriceOracle is Ownable {
    /**ERRORS */
    error PriceOracle__InvaidToken();

    /**STATE VARIABLES */
    mapping(address => address) private s_priceFeeds;

    /**EVENTS */
    event PriceFeedUpdated(
        address indexed tokenAddress,
        address indexed priceFeed
    );

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

    /**
     * @notice Returns the latest price of a token.
     * @param tokenAddress The token address.
     * @return The latest price in USD with 8 decimals.
     */
    function getLatestPrice(
        address tokenAddress
    ) public view returns (uint256) {
        if (s_priceFeeds[tokenAddress] == address(0)) {
            revert PriceOracle__InvaidToken();
        }

        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            s_priceFeeds[tokenAddress]
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
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
        return (amount * price);
    }

    /**VIEW FUNCTION */
    function getPriceFeed(
        address tokenAddress
    ) external view returns (address) {
        return s_priceFeeds[tokenAddress];
    }
}
