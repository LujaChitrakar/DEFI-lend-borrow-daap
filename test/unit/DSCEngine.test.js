// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("DSCEngine", function () {
//   let dscEngine;
//   let priceOracle;
//   let interestRateModel;
//   let usdc;
//   let owner;
//   let user1;
//   let user2;
//   let liquidator;

//   const USDC_ADDRESS = "0x76eFc6B7aDac502DC210f255ea8420672C1355d3";
//   const ETH_AMOUNT = ethers.utils.parseEther("1.0");
//   const USDC_AMOUNT = ethers.utils.parseUnits("1000", 6); // Assuming 6 decimals for USDC

//   beforeEach(async function () {
//     [owner, user1, user2, liquidator] = await ethers.getSigners();

//     // Deploy mock contracts
//     const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
//     priceOracle = await MockPriceOracle.deploy();
//     await priceOracle.deployed();

//     const MockInterestRateModel = await ethers.getContractFactory(
//       "MockInterestRateModel"
//     );
//     interestRateModel = await MockInterestRateModel.deploy();
//     await interestRateModel.deployed();

//     // Deploy main contract
//     const DSCEngine = await ethers.getContractFactory("DSCEngine");
//     dscEngine = await DSCEngine.deploy(
//       priceOracle.address,
//       interestRateModel.address
//     );
//     await dscEngine.deployed();

//     // Setup USDC mock
//     const MockERC20 = await ethers.getContractFactory("MockERC20");
//     usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
//     await usdc.deployed();

//     // Configure price oracle
//     await priceOracle.setEthPrice(ethers.utils.parseUnits("2000", 18)); // $2000 per ETH
//     await priceOracle.setTokenPrice(
//       USDC_ADDRESS,
//       ethers.utils.parseUnits("1", 18)
//     ); // $1 per USDC

//     // Mint USDC to users
//     await usdc.mint(user1.address, USDC_AMOUNT);
//     await usdc.mint(user2.address, USDC_AMOUNT);
//     await usdc.mint(liquidator.address, USDC_AMOUNT.mul(10));

//     // Approve USDC spending
//     await usdc.connect(user1).approve(dscEngine.address, USDC_AMOUNT);
//     await usdc.connect(user2).approve(dscEngine.address, USDC_AMOUNT);
//     await usdc
//       .connect(liquidator)
//       .approve(dscEngine.address, USDC_AMOUNT.mul(10));
//   });

//   describe("Deposit Functions", function () {
//     it("Should allow depositing stablecoin", async function () {
//       await dscEngine.connect(user1).depositStablecoin(USDC_AMOUNT);
//       const balance = await dscEngine.getStableCoinBalance(user1.address);
//       expect(balance).to.equal(USDC_AMOUNT);
//     });

//     it("Should allow depositing ETH collateral", async function () {
//       await dscEngine.connect(user1).depositCollateral({ value: ETH_AMOUNT });
//       const collateral = await dscEngine.getCollateralDepositBalance(
//         user1.address
//       );
//       expect(collateral).to.equal(ETH_AMOUNT);
//     });

//     it("Should allow combined deposit and borrow", async function () {
//       // First deposit some USDC to the protocol
//       await dscEngine.connect(user2).depositStablecoin(USDC_AMOUNT);

//       // User1 deposits ETH and borrows in one transaction
//       await dscEngine
//         .connect(user1)
//         .depositCollateralAndBorrowStablecoin({ value: ETH_AMOUNT });

//       const collateral = await dscEngine.getCollateralDepositBalance(
//         user1.address
//       );
//       expect(collateral).to.equal(ETH_AMOUNT);

//       const borrowed = await dscEngine.getDebtBalance(user1.address);
//       expect(borrowed).to.be.gt(0);
//     });
//   });

//   describe("Borrowing and Repayment", function () {
//     beforeEach(async function () {
//       // Setup: User2 deposits liquidity
//       await dscEngine.connect(user2).depositStablecoin(USDC_AMOUNT);
//       // User1 deposits collateral
//       await dscEngine.connect(user1).depositCollateral({ value: ETH_AMOUNT });
//     });

//     it("Should allow borrowing stablecoin against collateral", async function () {
//       const borrowAmount = USDC_AMOUNT.div(4); // Borrow 25% of deposited USDC
//       await dscEngine.connect(user1).borrowStablecoin(borrowAmount);

//       const debtBalance = await dscEngine.getDebtBalance(user1.address);
//       expect(debtBalance).to.equal(borrowAmount);
//     });

//     it("Should prevent borrowing beyond collateral ratio", async function () {
//       const tooMuch = USDC_AMOUNT;
//       await expect(dscEngine.connect(user1).borrowStablecoin(tooMuch)).to.be
//         .reverted;
//     });

//     it("Should allow loan repayment", async function () {
//       // Borrow first
//       const borrowAmount = USDC_AMOUNT.div(4);
//       await dscEngine.connect(user1).borrowStablecoin(borrowAmount);

//       // Approve USDC for repayment
//       await usdc.connect(user1).approve(dscEngine.address, borrowAmount);

//       // Repay loan
//       await dscEngine.connect(user1).repayLoan(borrowAmount);

//       // Check debt balance
//       const debtBalance = await dscEngine.getDebtBalance(user1.address);
//       expect(debtBalance).to.equal(0);
//     });
//   });

//   describe("Collateral Management", function () {
//     beforeEach(async function () {
//       // Setup: User1 deposits collateral and borrows
//       await dscEngine.connect(user2).depositStablecoin(USDC_AMOUNT);
//       await dscEngine.connect(user1).depositCollateral({ value: ETH_AMOUNT });
//       await dscEngine.connect(user1).borrowStablecoin(USDC_AMOUNT.div(5));
//     });

//     it("Should allow withdrawing excess collateral", async function () {
//       const withdrawAmount = ETH_AMOUNT.div(10);
//       await dscEngine.connect(user1).withdrawCollateral(withdrawAmount);

//       const collateral = await dscEngine.getCollateralDepositBalance(
//         user1.address
//       );
//       expect(collateral).to.equal(ETH_AMOUNT.sub(withdrawAmount));
//     });

//     it("Should prevent withdrawing too much collateral", async function () {
//       const tooMuch = ETH_AMOUNT.div(2);
//       await expect(dscEngine.connect(user1).withdrawCollateral(tooMuch)).to.be
//         .reverted;
//     });
//   });

//   describe("Liquidation", function () {
//     beforeEach(async function () {
//       // Setup: User deposits and borrows at threshold
//       await dscEngine.connect(user2).depositStablecoin(USDC_AMOUNT);
//       await dscEngine.connect(user1).depositCollateral({ value: ETH_AMOUNT });

//       // Borrow near max
//       const borrowAmount = USDC_AMOUNT.div(3);
//       await dscEngine.connect(user1).borrowStablecoin(borrowAmount);
//     });

//     it("Should allow liquidation when collateral value drops", async function () {
//       // Drop ETH price, making user1 undercollateralized
//       await priceOracle.setEthPrice(ethers.utils.parseUnits("1000", 18));

//       // Check if user can be liquidated
//       const canLiquidate = await dscEngine.canUserBeLiquidated(user1.address);
//       expect(canLiquidate).to.be.true;

//       // Prepare liquidator
//       const debtBalance = await dscEngine.getDebtBalance(user1.address);

//       // Liquidate
//       await dscEngine.connect(liquidator).liquidate(user1.address, debtBalance);

//       // Check debt is reduced
//       const newDebtBalance = await dscEngine.getDebtBalance(user1.address);
//       expect(newDebtBalance).to.equal(0);
//     });

//     it("Should prevent liquidation of healthy positions", async function () {
//       // Increase ETH price, making position healthier
//       await priceOracle.setEthPrice(ethers.utils.parseUnits("3000", 18));

//       const debtBalance = await dscEngine.getDebtBalance(user1.address);
//       await expect(
//         dscEngine.connect(liquidator).liquidate(user1.address, debtBalance)
//       ).to.be.reverted;
//     });
//   });

//   describe("Interest Accrual", function () {
//     it("Should accrue interest for lenders", async function () {
//       // Setup mocks for interest accrual
//       await interestRateModel.setAccruedInterest(
//         user1.address,
//         ethers.utils.parseUnits("10", 6)
//       );

//       // Deposit stablecoin
//       await dscEngine.connect(user1).depositStablecoin(USDC_AMOUNT);

//       // Fast forward time (would be implemented in actual tests)
//       // ...

//       // Check earned interest
//       const interest = await dscEngine.getYourEarnedLendingInterest();
//       expect(interest).to.equal(ethers.utils.parseUnits("10", 6));
//     });

//     it("Should accrue interest for borrowers", async function () {
//       // Similar test for borrower interest
//       // ...
//     });
//   });

//   describe("Health Factor", function () {
//     it("Should calculate health factor correctly", async function () {
//       // Setup user position
//       await dscEngine.connect(user2).depositStablecoin(USDC_AMOUNT);
//       await dscEngine.connect(user1).depositCollateral({ value: ETH_AMOUNT });
//       await dscEngine.connect(user1).borrowStablecoin(USDC_AMOUNT.div(4));

//       // Calculate expected health factor: (collateralValue * threshold) / (debtValue * 100) * precision
//       const ethPrice = ethers.utils.parseUnits("2000", 18);
//       const collateralValue = ETH_AMOUNT.mul(ethPrice).div(
//         ethers.utils.parseEther("1")
//       );
//       const debtValue = USDC_AMOUNT.div(4);
//       const expectedHealthFactor = collateralValue
//         .mul(150)
//         .mul(ethers.utils.parseEther("1"))
//         .div(debtValue.mul(100));

//       const healthFactor = await dscEngine.getHealthFactor(user1.address);

//       // Allow some difference due to rounding
//       expect(healthFactor).to.be.closeTo(
//         expectedHealthFactor,
//         ethers.utils.parseEther("0.1")
//       );
//     });
//   });
// });
