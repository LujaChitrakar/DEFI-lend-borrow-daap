// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("DSCEngine - Lenders", function () {
//   let DSCEngine,
//     dsce,
//     USDC,
//     owner,
//     lender,
//     otherUser,
//     interestModel,
//     oracle,
//     USDC_ADDRESS;

//   beforeEach(async function () {
//     [owner, lender, otherUser] = await ethers.getSigners();

//     // Mock USDC Token
//     const MockERC20 = await ethers.getContractFactory("USDCToken");
//     USDC = await MockERC20.deploy(); // USDC has 6 decimals
//     await USDC.waitForDeployment();
//     USDC_ADDRESS = await USDC.getAddress();

//     // Mock Interest Rate Model
//     const InterestModel = await ethers.getContractFactory("InterestRateModel");
//     interestModel = await InterestModel.deploy();
//     await interestModel.waitForDeployment();

//     // Mock Price Oracle
//     const PriceOracle = await ethers.getContractFactory("PriceOracle");
//     oracle = await PriceOracle.deploy();
//     await oracle.waitForDeployment();

//     // Deploy DSCEngine
//     DSCEngine = await ethers.getContractFactory("DSCEngine");

//     // Send USDC_ADDRESS to the constructor or set it in the contract
//     dsce = await DSCEngine.deploy(
//       await oracle.getAddress(),
//       await interestModel.getAddress()
//     );
//     await dsce.waitForDeployment();
//     const usdcStorageSlot = "0x0"; // Replace with actual storage slot of USDC_ADDRESS if known
//     await ethers.provider.send("hardhat_setStorageAt", [
//       await dsce.getAddress(),
//       usdcStorageSlot,
//       ethers.zeroPadValue(USDC_ADDRESS, 32), // Ensure correct format
//     ]);

//     // Set USDC address in DSCEngine if it's not set in constructor
//     // Assuming you have a function to set the USDC address
//     if (typeof dsce.setUSDCAddress === "function") {
//       await dsce.setUSDCAddress(USDC_ADDRESS);
//     }

//     // Mint USDC to lender
//     await USDC.mint(await lender.getAddress(), ethers.parseUnits("1000", 6)); // 1000 USDC

//     // Approve DSCEngine to spend lender's USDC
//     await USDC.connect(lender).approve(
//       await dsce.getAddress(),
//       ethers.parseUnits("1000", 6)
//     );
//   });

//   it("Should allow lender to deposit stablecoin", async function () {
//     const depositAmount = ethers.parseUnits("100", 6); // 100 USDC
//     const lenderAddress = await lender.getAddress();

//     await expect(dsce.connect(lender).depositStablecoin(depositAmount))
//       .to.emit(dsce, "StableCoinDeposited")
//       .withArgs(lenderAddress, depositAmount);

//     // const balance = await dsce.s_stableCoinDeposit(lenderAddress);
//     // expect(balance).to.equal(depositAmount);
//   });

//   it("Should not allow depositing 0 stablecoin", async function () {
//     await expect(
//       dsce.connect(lender).depositStablecoin(0)
//     ).to.be.revertedWithCustomError(dsce, "DSCEngine__NeedsMoreThanZero");
//   });

//   it("Should accrue interest on deposit", async function () {
//     const depositAmount = ethers.parseUnits("100", 6);

//     // Mock the accureInterest function to handle this test properly
//     // This assumes your InterestRateModel has an event for InterestAccrued
//     await dsce.connect(lender).depositStablecoin(depositAmount);

//     // Simulate time passing
//     await ethers.provider.send("evm_increaseTime", [10]);
//     await ethers.provider.send("evm_mine");

//     // Second deposit
//     // We can either check for an event or verify state change
//     await dsce.connect(lender).depositStablecoin(depositAmount);

//     // Check that total deposit is greater than or equal to 2x deposit amount
//     // (should include some interest)
//     const lenderAddress = await lender.getAddress();
//     const balance = await dsce.s_stableCoinDeposit(lenderAddress);
//     expect(balance).to.be.at.least(depositAmount * BigInt(2));
//   });

//   it("Should allow lender to withdraw stablecoin with interest", async function () {
//     const depositAmount = ethers.parseUnits("100", 6);
//     const lenderAddress = await lender.getAddress();

//     // Deposit USDC
//     await dsce.connect(lender).depositStablecoin(depositAmount);

//     // Initial balance after deposit
//     const initialBalance = await dsce.s_stableCoinDeposit(lenderAddress);
//     expect(initialBalance).to.equal(depositAmount);

//     // Simulate time passing
//     await ethers.provider.send("evm_increaseTime", [1000]);
//     await ethers.provider.send("evm_mine");

//     // Get USDC balance before withdrawal
//     const usdcBalanceBefore = await USDC.balanceOf(lenderAddress);

//     // Withdraw USDC
//     await dsce.connect(lender).withdrawStablecoin(depositAmount);

//     // Get USDC balance after withdrawal
//     const usdcBalanceAfter = await USDC.balanceOf(lenderAddress);

//     // Check that user received at least the amount they deposited
//     // (should include some interest)
//     expect(usdcBalanceAfter - usdcBalanceBefore).to.be.at.least(depositAmount);

//     // Check that user's deposit in contract is now 0
//     const finalBalance = await dsce.s_stableCoinDeposit(lenderAddress);
//     expect(finalBalance).to.equal(0);
//   });

//   it("Should revert on withdrawal if balance is insufficient", async function () {
//     const lenderAddress = await lender.getAddress();
//     const withdrawAmount = ethers.parseUnits("100", 6);

//     // No deposit made, so balance should be 0
//     const balance = await dsce.s_stableCoinDeposit(lenderAddress);
//     expect(balance).to.equal(0);

//     // Attempt to withdraw should fail
//     await expect(
//       dsce.connect(lender).withdrawStablecoin(withdrawAmount)
//     ).to.be.revertedWith("Insufficient balance");
//   });

//   it("Should revert if protocol has insufficient liquidity", async function () {
//     const depositAmount = ethers.parseUnits("100", 6);
//     const dscAddress = await dsce.getAddress();

//     // Deposit funds
//     await dsce.connect(lender).depositStablecoin(depositAmount);

//     if (typeof dsce.adminWithdraw === "function") {
//       await dsce.connect(owner).adminWithdraw(USDC_ADDRESS, depositAmount);
//     }
//     // Option 2: Try to manipulate the USDC balance directly
//     else {
//       // Check if we can transfer USDC out of the contract some other way
//       const contractBalance = await USDC.balanceOf(dscAddress);
//       console.log("Contract USDC balance:", contractBalance.toString());

//       // For testing purposes, we might need to just set expectations based on checks
//       if (contractBalance < depositAmount) {
//         console.log("Contract already has insufficient funds");
//       }
//     }

//     // Attempt to withdraw should fail due to insufficient liquidity
//     await expect(
//       dsce.connect(lender).withdrawStablecoin(depositAmount)
//     ).to.be.revertedWith("Insufficient protocol liquidity");
//   });
// });
