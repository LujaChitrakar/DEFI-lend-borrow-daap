const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DSCEngine Lenders", function () {
  let dscEngine,
    interestRateModel,
    priceOracle,
    owner,
    lender,
    otherUser,
    mockUSDC;
  //   const USDC_ADDRESS = "0x76efc6b7adac502dc210f255ea8420672c1355d3";
  beforeEach(async function () {
    [owner, lender, otherUser] = await ethers.getSigners();

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
      .transfer(lender.address, ethers.parseUnits("1000", 6));
  });

  /**DEPOSIT STABLECOIN */
  it("Stablecoin should be more than Zero", async function () {
    await expect(
      dscEngine.connect(lender).depositStablecoin(0)
    ).to.be.revertedWithCustomError(dscEngine, "DSCEngine__NeedsMoreThanZero");
  });

  it("should deposit valid stablecoin", async function () {
    await expect(
      dscEngine.connect(lender).depositStablecoin(10)
    ).to.not.be.revertedWithCustomError(
      dscEngine,
      "DSCEngine__NotAllowedToken"
    );
  });

  it("Should allow lender to deposit", async function () {
    const depositAmount = ethers.parseUnits("100", 6);
    const lenderAddress = await lender.getAddress();

    const initalInterest = await dscEngine.getAccuredInterest(lenderAddress);
    expect(initalInterest).to.equal(0n);

    await mockUSDC.mint(owner.address, ethers.parseUnits("1000", 6));
    // Transfer USDC to lender
    await mockUSDC.connect(owner).transfer(lender.address, depositAmount);

    await mockUSDC
      .connect(lender)
      .approve(dscEngine.getAddress(), depositAmount);

    await expect(dscEngine.connect(lender).depositStablecoin(depositAmount))
      .to.emit(dscEngine, "StableCoinDeposited")
      .withArgs(lenderAddress, depositAmount);

    // Fast-forward time by 1 day
    await ethers.provider.send("evm_increaseTime", [86400]); // 1 day = 86400 seconds
    await ethers.provider.send("evm_mine", []);

    await interestRateModel.accureInterest(lenderAddress, depositAmount, true);

    const finalInterest = await dscEngine.getAccuredInterest(lenderAddress);

    const balance = await dscEngine.getStableCoinBalance(lenderAddress);
    expect(balance).to.equal(depositAmount);
    expect(finalInterest).to.be.greaterThan(initalInterest);
  });

  /**WITHDRAW STABLECOIN */
  it("Should revert if amount deposited less than amount to be withdrawn", async function () {
    const withdrawAmount = ethers.parseUnits("100", 6);
    const lenderAddress = await lender.getAddress();

    await expect(
      dscEngine.connect(lender).withdrawStablecoin(withdrawAmount)
    ).to.be.revertedWith("Not sufficient deposit");
  });

  it("Should be able to withdraw stablecoin", async function () {
    const depositAmount = ethers.parseUnits("100", 6);
    const withdrawAmount = ethers.parseUnits("1", 6);
    const lenderAddress = await lender.getAddress();

    await mockUSDC.mint(lenderAddress, ethers.parseUnits("1000", 6));
    await mockUSDC.mint(dscEngine.getAddress(), ethers.parseUnits("500", 6));

    await mockUSDC
      .connect(lender)
      .approve(dscEngine.getAddress(), depositAmount);

    await expect(dscEngine.connect(lender).depositStablecoin(depositAmount))
      .to.emit(dscEngine, "StableCoinDeposited")
      .withArgs(lenderAddress, depositAmount);

    await expect(dscEngine.connect(lender).withdrawStablecoin(withdrawAmount))
      .to.emit(dscEngine, "StableCoinWithdrawn")
      .withArgs(lenderAddress, withdrawAmount);
  });
});
