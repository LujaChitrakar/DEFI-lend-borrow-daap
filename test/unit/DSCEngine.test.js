// // SPDX-License-Identifier:MIT
// require("chai");
// require("hardhat");

// describe("DSCEngine", async function () {
//   let dsce, usdc, usdt, ERC20Mock, owner, user;

//   beforeEach(async function () {
//     [owner, user] = await ethers.getSigners();

//     const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
//     usdc = await ERC20Mock.deploy();
//     usdt = await ERC20Mock.deploy();

//     const DSCEngine = await ethers.getContractFactory("DSCEngine");
//     dsce = await DSCEngine.deploy();

//     await dsce.allowedToken(usdc.address, owner.address);
//     await dsce.allowedToken(usdt.address, owner.address);

//     await usdc.mint(user.address, ethers.utils.parseUnits("1000", 18));
//     await usdt.mint(user.address, ethers.utils.parseUnits("1000", 18));

//     await usdc
//       .connect(user)
//       .approve(dsce.address, ethers.utils.parseUnits("500", 18));
//     await usdt
//       .connect(user)
//       .approve(dsce.address, ethers.utils.parseUnits("500", 18));
//   });

//   /**DEPOSIT TESTS */
//   it("Should allow deposit of USDC", async function () {
//     const depositAmount = ethers.utils.parseUnits("100", 18);

//     await expect(dsce.connect(user).depositStableCoins(usdc, depositAmount))
//       .to.emit(dsce, "StableCoinDeposited")
//       .withArgs(user.address, usdc.address, depositAmount);
//   });
// });
