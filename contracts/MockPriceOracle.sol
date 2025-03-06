// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract MockPriceOracle {
    mapping(address => uint256) private prices;
    uint256 private ethPrice;
    mapping(address => uint256) private collateralValues;

    function setEthPrice(uint256 _price) external {
        ethPrice = _price;
    }

    function setTokenPrice(address token, uint256 price) external {
        prices[token] = price;
    }

    function getLatestPrice(address token) external view returns (uint256) {
        return prices[token];
    }

    function getEthLatestPrice() external view returns (uint256) {
        return ethPrice;
    }

    function getEthValueInUsd(
        uint256 ethAmount
    ) external view returns (uint256) {
        return (ethAmount * ethPrice) / 1e18;
    }

    function getTokenValueInUsd(
        address token,
        uint256 amount
    ) external view returns (uint256) {
        return (amount * prices[token]) / 1e18;
    }

    function updateCollateral(address user, uint256 amount) external {
        collateralValues[user] = amount;
    }

    function getCollateralValue(address user) external view returns (uint256) {
        return (collateralValues[user] * ethPrice) / 1e18;
    }
}
