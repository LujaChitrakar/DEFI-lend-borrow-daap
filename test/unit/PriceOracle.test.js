const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PriceOracle", function () {
  let priceOracle;
  let owner;
  let user;
  let mockEthPriceFeed;
  let mockTokenPriceFeed;
  const TOKEN_ADDRESS = "0x1234567890123456789012345678901234567890";

  // Chainlink price feeds return prices with 8 decimals
  const ETH_PRICE = 200000000000; // $2000 with 8 decimals
  const USDC_PRICE = 100000000; // $1 with 8 decimals

  const ETH_AMOUNT = ethers.parseEther("1.0"); // 1 ETH in wei (18 decimals)

  beforeEach(async function () {
    // Deploy mock price feeds with 8 decimals (Chainlink standard)
    const MockV3Aggregator = await ethers.getContractFactory(
      "MockV3Aggregator"
    );
    mockEthPriceFeed = await MockV3Aggregator.deploy(8, ETH_PRICE);
    mockTokenPriceFeed = await MockV3Aggregator.deploy(8, USDC_PRICE);

    // Deploy PriceOracle
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    [owner, user] = await ethers.getSigners();
    priceOracle = await PriceOracle.deploy();

    // Set up price feeds
    await priceOracle.setPriceFeed(TOKEN_ADDRESS, mockEthPriceFeed.target);
    await priceOracle.setEthPriceFeed(mockEthPriceFeed.target);
  });

  it("Should set and get price feed", async function () {
    const priceFeed = await priceOracle.getPriceFeed(TOKEN_ADDRESS);
    expect(priceFeed).to.equal(mockEthPriceFeed.target);
  });

  it("Should get latest ETH price", async function () {
    const price = await priceOracle.getEthLatestPrice();
    expect(price).to.equal(ETH_PRICE);
  });

  it("Should get latest token price scaled to 18 decimals", async function () {
    const price = await priceOracle.getLatestPrice(TOKEN_ADDRESS);
    // Contract scales Chainlink price (8 decimals) by 1e10 to get 18 decimals
    const expectedPrice = BigInt(ETH_PRICE) * 10n ** 10n;
    expect(price).to.equal(expectedPrice);
  });

  it("Should convert token amount to USD value", async function () {
    const tokenAmount = ethers.parseEther("1.0"); // 1 token with 18 decimals
    const usdValue = await priceOracle.getTokenValueInUsd(
      TOKEN_ADDRESS,
      tokenAmount
    );

    // Expected calculation in the contract:
    // (1 token * ($2000 * 1e10)) / 1e18 = $2000 with 18 decimals
    const expectedValue = ethers.parseEther("2000");
    expect(usdValue).to.equal(expectedValue);
  });

  it("Should convert ETH amount to USD value", async function () {
    const ethAmount = ethers.parseEther("1.0"); // 1 ETH with 18 decimals
    const usdValue = await priceOracle.getEthValueInUsd(ethAmount);

    // Expected calculation in the contract:
    // (1 ETH * $2000) / 1e18 = $2000 / 1e18
    // With 8 decimals for price, the result would be much smaller than $2000
    const expectedValue = (BigInt(ETH_AMOUNT) * BigInt(ETH_PRICE)) / 10n ** 18n;
    expect(usdValue).to.equal(expectedValue);
  });

  it("Should update and get collateral value", async function () {
    // Update user's collateral
    await priceOracle.updateCollateral(user.address, ETH_AMOUNT);

    // Get collateral value in USD
    const collateralValue = await priceOracle.getCollateralValue(user.address);

    // Expected calculation similar to getEthValueInUsd
    const expectedValue = (BigInt(ETH_AMOUNT) * BigInt(ETH_PRICE)) / 10n ** 18n;
    expect(collateralValue).to.equal(expectedValue);
  });
});
