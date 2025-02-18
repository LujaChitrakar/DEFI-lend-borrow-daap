// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import {MockV3Aggregator} from "../test/mocks/MockV3Aggregator.sol";
import {ERC20Mock} from "./MockToken.sol";

contract HelperConfig {
    struct NetworkConfig {
        address usdcUsdPriceFeed;
        address usdc;
    }

    uint8 public constant DECIMALS = 8;
    int256 public constant USDC_USD_PRICE = 1e8;

    NetworkConfig public activeNetworkConfig;

    constructor() {
        if (block.chainid == 11155111) {
            activeNetworkConfig = getSepoliaEthConfig();
        } else {
            activeNetworkConfig = getOrCreateHardhatEthConfig();
        }
    }

    /*
     *the address is generated from docs.chain.link feedPrice address for Eth/USD or BTC/USD to get realtime prices on the collateral
     */

    function getSepoliaEthConfig() public pure returns (NetworkConfig memory) {
        return
            NetworkConfig({
                usdcUsdPriceFeed: 0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E,
                usdc: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
            });
    }

    function getOrCreateHardhatEthConfig()
        public
        returns (NetworkConfig memory)
    {
        if (activeNetworkConfig.usdcUsdPriceFeed != address(0)) {
            return activeNetworkConfig;
        }

        MockV3Aggregator usdcUsdPriceFeed = new MockV3Aggregator(
            DECIMALS,
            USDC_USD_PRICE
        );
        uint256 initialSupply = 1000;

        ERC20Mock usdcMock = new ERC20Mock(
            "USD Coin",
            "USDC Coin",
            initialSupply
        );
        return
            NetworkConfig({
                usdcUsdPriceFeed: address(usdcUsdPriceFeed),
                usdc: address(usdcMock)
            });
    }
}
