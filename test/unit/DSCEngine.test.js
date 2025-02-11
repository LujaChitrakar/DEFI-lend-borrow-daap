// SPDX-License-Identifier:MIT
require("chai");
require("hardhat");

describe("DSCEngine", async function () {
  let dsce, usdc, usdt, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    usdc = await ERC20Mock.deploy();
    usdt = await ERC20Mock.deploy();

    const DSCEngine = await ethers.getContractFactory("DSCEngine");
    dsce = await DSCEngine.deploy();
    console.log("USDC Deployment:", usdc);
    console.log("USDT Deployment:", usdt);

    // Ensure they have addresses
    if (!usdc.address || !usdt.address) {
      console.error("Deployment failed: Contract address is null");
      throw new Error("Deployment failed: Contract address is null");
    }

    await dsce.addAllowedToken(usdc.target, owner.address);
    await dsce.addAllowedToken(usdt.target, owner.address);

    await usdc.mint(user.address, 100);
    await usdt.mint(user.address, 100);

    console.log(usdc.mint);

    await usdc.connect(user).approve(dsce.address, 100);
    await usdt.connect(user).approve(dsce.address, 100);
  });

  /**DEPOSIT TESTS */
  it("Should allow deposit of USDC", async function () {
    const depositAmount = 100;

    await expect(
      dsce.connect(user).depositStableCoins(usdc.target, depositAmount)
    )
      .to.emit(dsce, "StableCoinDeposited")
      .withArgs(user.address, usdc.address, depositAmount);
  });
});
