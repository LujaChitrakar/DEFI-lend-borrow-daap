const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PriceOracle", function () {
  let priceOracle;
  let owner;
  let user;
  let mockEthPriceFeed;
  let mockTokenPriceFeed;

  const TOKEN_ADDRESS = "0x1234567890123456789012345678901234567890";
  const MOCK_PRICE = 2000000000000000000000n; // $2000 with 8 decimals
  const SCALE_FACTOR = 10n ** 10n;
  const ETH_AMOUNT = ethers.parseEther("1.0");

  beforeEach(async function () {
    // Deploy mock price feeds
    const MockV3Aggregator = await ethers.getContractFactory(
      "MockV3Aggregator"
    );
    mockEthPriceFeed = await MockV3Aggregator.deploy(8, MOCK_PRICE);
    mockTokenPriceFeed = await MockV3Aggregator.deploy(8, MOCK_PRICE);

    // Deploy PriceOracle
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    [owner, user] = await ethers.getSigners();
    priceOracle = await PriceOracle.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await priceOracle.owner()).to.equal(owner.address);
    });
  });

  describe("Price Feed Management", function () {
    it("Should allow owner to set price feed for a token", async function () {
      await expect(
        priceOracle.setPriceFeed(TOKEN_ADDRESS, mockTokenPriceFeed.target)
      )
        .to.emit(priceOracle, "PriceFeedUpdated")
        .withArgs(TOKEN_ADDRESS, mockTokenPriceFeed.target);

      expect(await priceOracle.getPriceFeed(TOKEN_ADDRESS)).to.equal(
        mockTokenPriceFeed.target
      );
    });

    it("Should allow owner to set ETH price feed", async function () {
      await priceOracle.setEthPriceFeed(mockEthPriceFeed.target);

      // We need to implement a getter for s_ethPriceFeed to test this properly
      // For now, we'll test the functionality through getEthLatestPrice
      await expect(priceOracle.getEthLatestPrice()).to.not.be.reverted;
    });

    it("Should revert when non-owner tries to set price feed", async function () {
      await expect(
        priceOracle
          .connect(user)
          .setPriceFeed(TOKEN_ADDRESS, mockTokenPriceFeed.target)
      ).to.be.reverted;
    });

    it("Should revert when non-owner tries to set ETH price feed", async function () {
      await expect(
        priceOracle.connect(user).setEthPriceFeed(mockEthPriceFeed.target)
      ).to.be.reverted;
    });
  });

  describe("Price Queries", function () {
    beforeEach(async function () {
      await priceOracle.setPriceFeed(TOKEN_ADDRESS, mockTokenPriceFeed.target);
      await priceOracle.setEthPriceFeed(mockEthPriceFeed.target);
    });

    // it("Should get the latest token price", async function () {
    //   const price = await priceOracle.getLatestPrice(TOKEN_ADDRESS);
    //   expect(price).to.equal(MOCK_PRICE);
    // });

    it("Should get the latest ETH price", async function () {
      const price = await priceOracle.getEthLatestPrice();
      // The price is multiplied by 1e10 in the contract
      expect(price).to.equal(MOCK_PRICE);
    });

    it("Should revert when querying ETH price with unset ETH price feed", async function () {
      // Deploy a new instance without setting ETH price feed
      const PriceOracle = await ethers.getContractFactory("PriceOracle");
      const newPriceOracle = await PriceOracle.deploy();

      await expect(
        newPriceOracle.getEthLatestPrice()
      ).to.be.revertedWithCustomError(
        newPriceOracle,
        "PriceOracle__InvaidCollateral"
      );
    });

    // it("Should convert token amount to USD value", async function () {
    //   const tokenAmount = ethers.parseUnits("1.0"); // 1 token with 18 decimals
    //   const usdValue = await priceOracle.getTokenValueInUsd(
    //     TOKEN_ADDRESS,
    //     tokenAmount
    //   );

    //   // 1 token * $2000 = $2000 with 18 decimals
    //   const expectedValue = ethers.parseUnits("2000");
    //   expect(usdValue).to.equal(expectedValue);
    // });

    it("Should convert ETH amount to USD value", async function () {
      const ethAmount = ethers.parseEther("1.0"); // 1 ETH
      const usdValue = await priceOracle.getEthValueInUsd(ethAmount);

      // 1 ETH * $2000 = $2000 with 18 decimals
      const expectedValue = ethers.parseUnits("2000", 18n);
      expect(usdValue).to.equal(expectedValue);
    });
  });

  describe("Collateral Management", function () {
    beforeEach(async function () {
      await priceOracle.setEthPriceFeed(mockEthPriceFeed.target);
    });

    it("Should allow owner to update collateral for a user", async function () {
      await expect(priceOracle.updateCollateral(user.address, ETH_AMOUNT))
        .to.emit(priceOracle, "collateralUpdated")
        .withArgs(user.address, ETH_AMOUNT);
    });

    it("Should revert when non-owner tries to update collateral", async function () {
      await expect(
        priceOracle.connect(user).updateCollateral(user.address, ETH_AMOUNT)
      ).to.be.reverted;
    });

    it("Should get the correct collateral value in USD", async function () {
      await priceOracle.updateCollateral(user.address, ETH_AMOUNT);

      const collateralValue = await priceOracle.getCollateralValue(
        user.address
      );

      // 1 ETH * $2000 = $2000 with 18 decimals
      const expectedValue = ethers.parseUnits("2000", 18n);
      expect(collateralValue).to.equal(expectedValue);
    });

    it("Should return zero for users with no collateral", async function () {
      const collateralValue = await priceOracle.getCollateralValue(
        user.address
      );
      expect(collateralValue).to.equal(0);
    });
  });
});
