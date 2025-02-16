// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import {MockV3Aggregator} from "../test/mocks/MockV3Aggregator.sol";
import {ERC20Mock} from "./MockToken.sol";

contract HelperConfig {
    struct NetworkConfig {
        address wethUsdPriceFeed;
        address wbtcUsdPriceFeed;
        address usdcUsdPriceFeed;
        address usdtUsdPriceFeed;
        address weth;
        address wbtc;
        address usdc;
        address usdt;
    }

    uint8 public constant DECIMALS = 8;
    int256 public constant ETH_USD_PRICE = 2000e8;
    int256 public constant BTC_USD_PRICE = 1000e8;
    int256 public constant USDT_USD_PRICE = 1e8;
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
                wethUsdPriceFeed: 0x694AA1769357215DE4FAC081bf1f309aDC325306,
                wbtcUsdPriceFeed: 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43,
                usdcUsdPriceFeed: 0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E,
                usdtUsdPriceFeed: 0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E,
                weth: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,
                wbtc: 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599,
                usdc: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,
                usdt: 0xdAC17F958D2ee523a2206206994597C13D831ec7
            });
    }

    function getOrCreateHardhatEthConfig()
        public
        returns (NetworkConfig memory)
    {
        if (activeNetworkConfig.wethUsdPriceFeed != address(0)) {
            return activeNetworkConfig;
        }

        MockV3Aggregator ethUsdPriceFeed = new MockV3Aggregator(
            DECIMALS,
            ETH_USD_PRICE
        );
        MockV3Aggregator btcUsdPriceFeed = new MockV3Aggregator(
            DECIMALS,
            BTC_USD_PRICE
        );
        MockV3Aggregator usdcUsdPriceFeed = new MockV3Aggregator(
            DECIMALS,
            USDC_USD_PRICE
        );
        MockV3Aggregator usdtUsdPriceFeed = new MockV3Aggregator(
            DECIMALS,
            USDT_USD_PRICE
        );
        uint256 initialSupply = 1000;

        ERC20Mock wethMock = new ERC20Mock(
            "Wrapped ETH",
            "WETH",
            initialSupply
        );
        ERC20Mock wbtcMock = new ERC20Mock(
            "Wrapped BTC",
            "WBTC",
            initialSupply
        );
        ERC20Mock usdcMock = new ERC20Mock(
            "USD Coin",
            "USDC Coin",
            initialSupply
        );
        ERC20Mock usdtMock = new ERC20Mock("USD Tether", "USDT", initialSupply);

        return
            NetworkConfig({
                wethUsdPriceFeed: address(ethUsdPriceFeed),
                wbtcUsdPriceFeed: address(btcUsdPriceFeed),
                usdtUsdPriceFeed: address(usdtUsdPriceFeed),
                usdcUsdPriceFeed: address(usdcUsdPriceFeed),
                weth: address(wethMock),
                wbtc: address(wbtcMock),
                usdc: address(usdcMock),
                usdt: address(usdtMock)
            });
    }
}
