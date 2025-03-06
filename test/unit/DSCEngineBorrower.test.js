const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DSCEngine Borrower", function () {
  let dscEngine,
    interestRateModel,
    priceOracle,
    owner,
    borrower,
    otherUser,
    mockPriceFeed,
    mockUSDC;
  //   const USDC_ADDRESS = "0x76efc6b7adac502dc210f255ea8420672c1355d3";
  const ethUsdPriceFeedAddress = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";

  beforeEach(async function () {
    [owner, borrower, otherUser] = await ethers.getSigners();

    // deploy USDC mock
    const USDC = await ethers.getContractFactory("USDCToken");
    mockUSDC = await USDC.deploy();
    await mockUSDC.waitForDeployment();

    // deploy mockPriceFeed
    const MockPriceFeed = await ethers.getContractFactory("MockPriceOracle");
    const mockPriceFeed = await MockPriceFeed.deploy(); // $2000 per ETH
    await mockPriceFeed.waitForDeployment();

    // deploy interestRateModel
    const InterestRateModel = await ethers.getContractFactory(
      "InterestRateModel"
    );
    interestRateModel = await InterestRateModel.deploy();
    await interestRateModel.waitForDeployment();

    // deploy priceOracle
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();

    await mockPriceFeed.setEthPrice(ethers.parseUnits("2000", 8));

    // deploy DSCEngine
    const DSCEngine = await ethers.getContractFactory("DSCEngine");
    dscEngine = await DSCEngine.deploy(
      mockPriceFeed.getAddress(),
      interestRateModel.getAddress(),
      mockUSDC.getAddress()
    );
    await dscEngine.waitForDeployment();

    await mockUSDC.mint(owner.address, ethers.parseUnits("1000", 6));
    await mockUSDC
      .connect(owner)
      .transfer(borrower.address, ethers.parseUnits("1000", 6));
  });

  /**DEPOSIT COLLATERAL */
  it("Deposit amount must be greater than zero", async function () {
    await expect(
      dscEngine.connect(borrower).depositCollateral()
    ).to.be.revertedWithCustomError(dscEngine, "DSCEngine__NeedsMoreThanZero");
  });

  it("Should be able to deposit collateral and deposit is recorded and interest is generated", async function () {
    const depositAmount = ethers.parseEther("1");
    const borrowerAddress = await borrower.getAddress();

    const initalBalance = await dscEngine.getCollateralDepositBalance(
      borrowerAddress
    );
    expect(initalBalance).to.equal(0);

    const initalInterest = await dscEngine.getAccuredInterest(borrowerAddress);
    expect(initalInterest).to.equal(0n);

    await expect(
      dscEngine.connect(borrower).depositCollateral({ value: depositAmount })
    )
      .to.emit(dscEngine, "CollateralDeposited")
      .withArgs(borrowerAddress, depositAmount);

    // Fast-forward time by 1 day
    await ethers.provider.send("evm_increaseTime", [86400]); // 1 day = 86400 seconds
    await ethers.provider.send("evm_mine", []);
    await interestRateModel.accureInterest(
      borrowerAddress,
      depositAmount,
      false
    );

    const finalBalance = await dscEngine.getCollateralDepositBalance(
      borrowerAddress
    );
    const finalInterest = await dscEngine.getAccuredInterest(borrowerAddress);
    expect(finalInterest).to.be.greaterThan(initalInterest);
    expect(finalBalance).to.equal(depositAmount);
  });

  /**BORROW STABLECOIN */

  it("Deposit amount must be greater than zero", async function () {
    await expect(
      dscEngine.connect(borrower).borrowStablecoin(0)
    ).to.be.revertedWithCustomError(dscEngine, "DSCEngine__NeedsMoreThanZero");
  });

  it("Should have enough collateral to borrow stablecoin", async function () {
    const borrowAmount = ethers.parseUnits("100", 6);

    await expect(
      dscEngine.connect(borrower).borrowStablecoin(borrowAmount)
    ).to.be.revertedWith("Not enough collateral");
  });

  it("Should be able to borrow stablecoin", async function () {
    const depositAmount = ethers.parseEther("10");

    const borrowAmount = ethers.parseUnits("20", 6);
    const borrowerAddress = borrower.getAddress();
    await mockUSDC.mint(dscEngine.getAddress(), ethers.parseUnits("500", 6));

    dscEngine.connect(borrower).depositCollateral({ value: depositAmount });

    await expect(dscEngine.connect(borrower).borrowStablecoin(borrowAmount))
      .to.emit(dscEngine, "StablecoinBorrowed")
      .withArgs(borrowerAddress, borrowAmount);
  });

  it("Should increase the interest after borrow stablecoin", async function () {
    const depositAmount = ethers.parseEther("10");

    const borrowAmount = ethers.parseUnits("20", 6);
    const borrowerAddress = borrower.getAddress();
    await mockUSDC.mint(dscEngine.getAddress(), ethers.parseUnits("500", 6));

    const initialInterest = await dscEngine.getAccuredInterest(borrowerAddress);
    expect(initialInterest).to.equal(0);

    dscEngine.connect(borrower).depositCollateral({ value: depositAmount });

    await ethers.provider.send("evm_increaseTime", [86400]); // 1 day = 86400 seconds
    await ethers.provider.send("evm_mine", []);

    await interestRateModel.accureInterest(
      borrowerAddress,
      borrowAmount,
      false
    );

    const finalInterest = await dscEngine.getAccuredInterest(borrowerAddress);
    expect(finalInterest).to.be.greaterThan(initialInterest);

    await dscEngine.connect(borrower).borrowStablecoin(borrowAmount);
  });
});
