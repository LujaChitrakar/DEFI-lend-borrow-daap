const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DSCEngine Borrower", function () {
  let dscEngine,
    interestRateModel,
    priceOracle,
    owner,
    borrower,
    otherUser,
    mockUSDC;
  //   const USDC_ADDRESS = "0x76efc6b7adac502dc210f255ea8420672c1355d3";

  beforeEach(async function () {
    [owner, borrower, otherUser] = await ethers.getSigners();

    // deploy USDC mock
    const USDC = await ethers.getContractFactory("USDCToken");
    mockUSDC = await USDC.deploy();
    await mockUSDC.waitForDeployment();

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

    // deploy DSCEngine
    const DSCEngine = await ethers.getContractFactory("DSCEngine");
    dscEngine = await DSCEngine.deploy(
      priceOracle.getAddress(),
      interestRateModel.getAddress(),
      mockUSDC.getAddress()
    );
    await dscEngine.waitForDeployment();

    await mockUSDC.mint(owner.address, ethers.parseUnits("1000", 6));
    await mockUSDC
      .connect(owner)
      .transfer(borrower.address, ethers.parseUnits("1000", 6));
  });

  it("Deposit amount must be greater than zero", async function () {
    await expect(
      dscEngine.connect(borrower).depositCollateral()
    ).to.be.revertedWithCustomError(dscEngine, "DSCEngine__NeedsMoreThanZero");
  });

  it("Should be able to deposit collateral and deposit is recorded", async function () {
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
});
