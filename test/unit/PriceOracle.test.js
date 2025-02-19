const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PriceOracle", function () {
  let PriceOracle, priceOracle, owner, user;
  let mockPriceFeed, mockEthPriceFeed;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy a mock price feed (for tokens)
    const MockPriceFeed = await ethers.getContractFactory("MockV3Aggregator");
    mockPriceFeed = await MockPriceFeed.deploy(8, 2000 * 1e8); // Price = $2000
    await mockPriceFeed.deployed();

    mockEthPriceFeed = await MockPriceFeed.deploy(8, 3000 * 1e8); // ETH Price = $3000
    await mockEthPriceFeed.deployed();

    // Deploy PriceOracle
    PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy();
    await priceOracle.deploy();
  });

  it("Should allow the owner to set a price feed", async function () {
    await priceOracle.setPriceFeed(
      mockPriceFeed.address,
      mockPriceFeed.address
    );
    expect(await priceOracle.getPriceFeed(mockPriceFeed.address)).to.equal(
      mockPriceFeed.address
    );
  });

  it("Should revert if a non-owner tries to set a price feed", async function () {
    await expect(
      priceOracle
        .connect(user)
        .setPriceFeed(mockPriceFeed.address, mockPriceFeed.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should retrieve the latest price correctly", async function () {
    await priceOracle.setPriceFeed(
      mockPriceFeed.address,
      mockPriceFeed.address
    );
    const price = await priceOracle.getLatestPrice(mockPriceFeed.address);
    expect(price).to.equal(
      ethers.BigNumber.from(2000).mul(ethers.BigNumber.from(10).pow(18))
    ); // 2000 * 1e18
  });

  it("Should revert when getting price for an unregistered token", async function () {
    await expect(
      priceOracle.getLatestPrice(mockPriceFeed.address)
    ).to.be.revertedWith("PriceOracle__InvaidToken");
  });

  it("Should set and retrieve ETH price feed correctly", async function () {
    await priceOracle.setEthPriceFeed(mockEthPriceFeed.address);
    expect(await priceOracle.getEthLatestPrice()).to.equal(
      ethers.BigNumber.from(3000).mul(ethers.BigNumber.from(10).pow(18))
    ); // 3000 * 1e18
  });

  it("Should calculate token value in USD correctly", async function () {
    await priceOracle.setPriceFeed(
      mockPriceFeed.address,
      mockPriceFeed.address
    );
    const amount = ethers.utils.parseUnits("2", 18); // 2 tokens
    const usdValue = await priceOracle.getTokenValueInUsd(
      mockPriceFeed.address,
      amount
    );
    expect(usdValue).to.equal(ethers.utils.parseUnits("4000", 18)); // 2 * 2000
  });

  it("Should update and retrieve collateral correctly", async function () {
    await priceOracle.updateCollateral(
      user.address,
      ethers.utils.parseUnits("1", 18)
    ); // 1 ETH
    expect(await priceOracle.getCollateralValue(user.address)).to.equal(
      ethers.utils.parseUnits("3000", 18)
    ); // 1 ETH = $3000
  });

  it("Should revert when non-owner tries to update collateral", async function () {
    await expect(
      priceOracle.connect(user).updateCollateral(user.address, 1000)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
