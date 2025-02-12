// SPDX-License-Identifier:MIT
require("chai");
require("hardhat");
const { expect } = require("chai");

describe("DSCEngine", async function () {
  let dsce, usdc, usdt, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    usdc = await ERC20Mock.deploy();
    usdt = await ERC20Mock.deploy();
    await usdc.waitForDeployment();
    await usdt.waitForDeployment();

    usdcAddress = await usdc.getAddress();
    usdtAddress = await usdc.getAddress();

    const DSCEngine = await ethers.getContractFactory("DSCEngine");
    const stableCoinAddresses = [usdcAddress, usdtAddress];
    const priceFeedAddresses = [owner.address, owner.address];
    const lendingTokenAddress = owner.address;
    dsce = await DSCEngine.deploy(
      stableCoinAddresses,
      priceFeedAddresses,
      lendingTokenAddress
    );
    await dsce.waitForDeployment();
    dsceAddress = await dsce.getAddress();
    // console.log("USDC Deployment:", dsceAddress);
    // console.log("USDT Deployment:", usdt);

    // Ensure they have addresses
    if (!usdcAddress || !usdtAddress) {
      console.error("Deployment failed: Contract address is null");
      throw new Error("Deployment failed: Contract address is null");
    }

    await dsce.connect(owner).addAllowedToken(usdcAddress, owner.address);
    await dsce.connect(owner).addAllowedToken(usdtAddress, owner.address);

    await usdc.mint(user.address, 100);
    await usdt.mint(user.address, 100);

    await usdc.connect(user).approve(dsceAddress, 100);
    await usdt.connect(user).approve(dsceAddress, 100);
  });

  /**DEPOSIT TESTS */
  it("Should emit when deposit of USDC", async function () {
    const depositAmount = 100;

    await expect(
      dsce.connect(user).depositStableCoins(usdcAddress, depositAmount)
    )
      .to.emit(dsce, "StableCoinDeposited")
      .withArgs(user.address, usdcAddress, depositAmount);
  });

  it("Should be greater than Zero", async function () {
    expect(
      dsce.connect(user).depositStableCoins(usdcAddress, 0)
    ).to.be.revertedWith("MoreThanZero");
  });

  it("Should be able to deposit USDC", async function () {
    const depositAmount = 100;
    await dsce.connect(user).depositStableCoins(usdcAddress, depositAmount);

    const balance = await dsce.getStableCoinBalance(user.address, usdcAddress);

    expect(balance).to.equal(depositAmount);
  });

  /**MINT LENDING TOKEN TESTS */
  it("Should be able to mint token", async function () {
    const amountOfToken = 10;
    await dsce.connect(user).mintLendingToken(amountOfToken);
    // const mintBalance = await dsce.getMintedLendingToken(user.address);
    // console.log(mintBalance);
    // expect(mintBalance).to.equal(amountOfToken);
  });
});
