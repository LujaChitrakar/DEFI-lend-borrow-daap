// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// describe("DSCEngine Contract Tests", function () {
//   async function deployContractsFixture() {
//     // Get signers
//     const [owner, lender, borrower, liquidator] = await ethers.getSigners();

//     // Deploy HelperConfig
//     const HelperConfig = await ethers.getContractFactory("HelperConfig");
//     const helperConfig = await HelperConfig.deploy();

//     // Get network config
//     const networkConfig = await helperConfig.activeNetworkConfig();

//     // Deploy MockV3Aggregator for ETH price feed
//     const MockV3Aggregator = await ethers.getContractFactory(
//       "MockV3Aggregator"
//     );
//     const ethUsdPriceFeed = await MockV3Aggregator.deploy(
//       8,
//       ethers.utils.parseUnits("2000", 8)
//     ); // $2000 per ETH

//     // Deploy InterestRateModel
//     const InterestRateModel = await ethers.getContractFactory(
//       "InterestRateModel"
//     );
//     const interestRateModel = await InterestRateModel.deploy();

//     // Deploy PriceOracle
//     const PriceOracle = await ethers.getContractFactory("PriceOracle");
//     const priceOracle = await PriceOracle.deploy();

//     // Set price feeds in PriceOracle
//     await priceOracle.setPriceFeed(
//       networkConfig.usdc,
//       networkConfig.usdcUsdPriceFeed
//     );
//     await priceOracle.setEthPriceFeed(ethUsdPriceFeed.address);

//     // Deploy DSCEngine
//     const DSCEngine = await ethers.getContractFactory("DSCEngine");
//     const dscEngine = await DSCEngine.deploy(
//       priceOracle.address,
//       interestRateModel.address
//     );

//     // Get USDC mock instance
//     const usdc = await ethers.getContractAt("ERC20Mock", networkConfig.usdc);

//     // Mint USDC to users
//     const usdcAmount = ethers.utils.parseEther("10000"); // 10,000 USDC
//     await usdc.mint(lender.address, usdcAmount);
//     await usdc.mint(borrower.address, usdcAmount);
//     await usdc.mint(liquidator.address, usdcAmount);

//     // Approve DSCEngine to spend USDC
//     await usdc
//       .connect(lender)
//       .approve(dscEngine.address, ethers.constants.MaxUint256);
//     await usdc
//       .connect(borrower)
//       .approve(dscEngine.address, ethers.constants.MaxUint256);
//     await usdc
//       .connect(liquidator)
//       .approve(dscEngine.address, ethers.constants.MaxUint256);

//     return {
//       dscEngine,
//       priceOracle,
//       interestRateModel,
//       usdc,
//       ethUsdPriceFeed,
//       owner,
//       lender,
//       borrower,
//       liquidator,
//     };
//   }

//   describe("Deployment", function () {
//     it("Should deploy successfully", async function () {
//       const { dscEngine, priceOracle, interestRateModel } = await loadFixture(
//         deployContractsFixture
//       );
//       expect(dscEngine.address).to.be.properAddress;
//     });

//     it("Should set the correct USDC address", async function () {
//       const { dscEngine } = await loadFixture(deployContractsFixture);
//       expect(await dscEngine.USDC_ADDRESS()).to.not.equal(
//         ethers.constants.AddressZero
//       );
//     });
//   });

//   describe("Lender Functions", function () {
//     it("Should allow depositing stablecoin", async function () {
//       const { dscEngine, usdc, lender } = await loadFixture(
//         deployContractsFixture
//       );
//       const depositAmount = ethers.utils.parseEther("1000");

//       await expect(dscEngine.connect(lender).depositStablecoin(depositAmount))
//         .to.emit(dscEngine, "StableCoinDeposited")
//         .withArgs(lender.address, depositAmount);

//       const lenderBalance = await dscEngine.getStableCoinBalance(
//         lender.address
//       );
//       expect(lenderBalance).to.equal(depositAmount);
//     });

//     it("Should revert when depositing zero amount", async function () {
//       const { dscEngine, lender } = await loadFixture(deployContractsFixture);

//       await expect(
//         dscEngine.connect(lender).depositStablecoin(0)
//       ).to.be.revertedWithCustomError(
//         dscEngine,
//         "DSCEngine__NeedsMoreThanZero"
//       );
//     });

//     it("Should allow withdrawing stablecoin", async function () {
//       const { dscEngine, usdc, lender } = await loadFixture(
//         deployContractsFixture
//       );
//       const depositAmount = ethers.utils.parseEther("1000");
//       const withdrawAmount = ethers.utils.parseEther("500");

//       // Deposit first
//       await dscEngine.connect(lender).depositStablecoin(depositAmount);

//       // Then withdraw
//       await expect(dscEngine.connect(lender).withdrawStablecoin(withdrawAmount))
//         .to.emit(dscEngine, "StableCoinWithdrawed")
//         .withArgs(lender.address, withdrawAmount);

//       const lenderBalance = await dscEngine.getStableCoinBalance(
//         lender.address
//       );
//       expect(lenderBalance).to.equal(depositAmount.sub(withdrawAmount));
//     });

//     it("Should revert when withdrawing more than deposited", async function () {
//       const { dscEngine, lender } = await loadFixture(deployContractsFixture);
//       const depositAmount = ethers.utils.parseEther("100");
//       const withdrawAmount = ethers.utils.parseEther("101");

//       // Deposit first
//       await dscEngine.connect(lender).depositStablecoin(depositAmount);

//       // Try to withdraw more
//       await expect(
//         dscEngine.connect(lender).withdrawStablecoin(withdrawAmount)
//       ).to.be.revertedWith("Insufficient balance");
//     });
//   });

//   describe("Borrower Functions", function () {
//     it("Should allow depositing collateral", async function () {
//       const { dscEngine, borrower } = await loadFixture(deployContractsFixture);
//       const collateralAmount = ethers.utils.parseEther("1");

//       await expect(
//         dscEngine
//           .connect(borrower)
//           .depositCollateral({ value: collateralAmount })
//       )
//         .to.emit(dscEngine, "CollateralDeposited")
//         .withArgs(borrower.address, collateralAmount);

//       const collateralBalance = await dscEngine.getCollateralDepositBalance(
//         borrower.address
//       );
//       expect(collateralBalance).to.equal(collateralAmount);
//     });

//     it("Should allow depositing collateral and borrowing in one transaction", async function () {
//       const { dscEngine, lender, borrower } = await loadFixture(
//         deployContractsFixture
//       );

//       // Lender deposits stablecoin
//       const lenderDepositAmount = ethers.utils.parseEther("10000");
//       await dscEngine.connect(lender).depositStablecoin(lenderDepositAmount);

//       // Borrower deposits collateral and borrows in one tx
//       const collateralAmount = ethers.utils.parseEther("2");

//       await expect(
//         dscEngine
//           .connect(borrower)
//           .depositCollateralAndBorrowStablecoin({ value: collateralAmount })
//       ).to.emit(dscEngine, "CollateralDepositedAndBorrowed");

//       const collateralBalance = await dscEngine.getCollateralDepositBalance(
//         borrower.address
//       );
//       expect(collateralBalance).to.equal(collateralAmount);

//       const debtBalance = await dscEngine.getDebtBalance(borrower.address);
//       expect(debtBalance).to.be.gt(0); // Should have borrowed some amount
//     });

//     it("Should allow borrowing stablecoin against deposited collateral", async function () {
//       const { dscEngine, lender, borrower } = await loadFixture(
//         deployContractsFixture
//       );

//       // Lender deposits stablecoin
//       const lenderDepositAmount = ethers.utils.parseEther("10000");
//       await dscEngine.connect(lender).depositStablecoin(lenderDepositAmount);

//       // Borrower deposits collateral
//       const collateralAmount = ethers.utils.parseEther("1");
//       await dscEngine
//         .connect(borrower)
//         .depositCollateral({ value: collateralAmount });

//       // Borrower borrows stablecoin
//       const borrowAmount = ethers.utils.parseEther("1000");
//       await expect(dscEngine.connect(borrower).borrowStablecoin(borrowAmount))
//         .to.emit(dscEngine, "StablecoinBorrowed")
//         .withArgs(borrower.address, borrowAmount);

//       const debtBalance = await dscEngine.getDebtBalance(borrower.address);
//       expect(debtBalance).to.equal(borrowAmount);
//     });

//     it("Should revert when trying to borrow more than allowed by collateral", async function () {
//       const { dscEngine, lender, borrower } = await loadFixture(
//         deployContractsFixture
//       );

//       // Lender deposits stablecoin
//       const lenderDepositAmount = ethers.utils.parseEther("10000");
//       await dscEngine.connect(lender).depositStablecoin(lenderDepositAmount);

//       // Borrower deposits collateral
//       const collateralAmount = ethers.utils.parseEther("1");
//       await dscEngine
//         .connect(borrower)
//         .depositCollateral({ value: collateralAmount });

//       // Try to borrow too much
//       const borrowAmount = ethers.utils.parseEther("2000"); // More than collateral supports
//       await expect(
//         dscEngine.connect(borrower).borrowStablecoin(borrowAmount)
//       ).to.be.revertedWith("Not enough collateral");
//     });

//     it("Should allow repaying loan", async function () {
//       const { dscEngine, lender, borrower } = await loadFixture(
//         deployContractsFixture
//       );

//       // Lender deposits stablecoin
//       const lenderDepositAmount = ethers.utils.parseEther("10000");
//       await dscEngine.connect(lender).depositStablecoin(lenderDepositAmount);

//       // Borrower deposits collateral
//       const collateralAmount = ethers.utils.parseEther("1");
//       await dscEngine
//         .connect(borrower)
//         .depositCollateral({ value: collateralAmount });

//       // Borrower borrows stablecoin
//       const borrowAmount = ethers.utils.parseEther("1000");
//       await dscEngine.connect(borrower).borrowStablecoin(borrowAmount);

//       // Repay loan
//       await expect(dscEngine.connect(borrower).repayLoan(borrowAmount))
//         .to.emit(dscEngine, "LoanRepaid")
//         .withArgs(borrower.address, borrowAmount);

//       const debtBalance = await dscEngine.getDebtBalance(borrower.address);
//       expect(debtBalance).to.equal(0);
//     });

//     it("Should allow withdrawing collateral", async function () {
//       const { dscEngine, borrower } = await loadFixture(deployContractsFixture);

//       // Deposit collateral
//       const collateralAmount = ethers.utils.parseEther("1");
//       await dscEngine
//         .connect(borrower)
//         .depositCollateral({ value: collateralAmount });

//       // Withdraw half
//       const withdrawAmount = ethers.utils.parseEther("0.5");
//       await expect(
//         dscEngine.connect(borrower).withdrawCollateral(withdrawAmount)
//       )
//         .to.emit(dscEngine, "CollateralWithdrawn")
//         .withArgs(borrower.address, withdrawAmount);

//       const collateralBalance = await dscEngine.getCollateralDepositBalance(
//         borrower.address
//       );
//       expect(collateralBalance).to.equal(collateralAmount.sub(withdrawAmount));
//     });

//     it("Should revert when trying to withdraw more collateral than deposited", async function () {
//       const { dscEngine, borrower } = await loadFixture(deployContractsFixture);

//       // Deposit collateral
//       const collateralAmount = ethers.utils.parseEther("1");
//       await dscEngine
//         .connect(borrower)
//         .depositCollateral({ value: collateralAmount });

//       // Try to withdraw more
//       const withdrawAmount = ethers.utils.parseEther("1.1");
//       await expect(
//         dscEngine.connect(borrower).withdrawCollateral(withdrawAmount)
//       ).to.be.revertedWith(" Amount exceeds total collateral deposited");
//     });
//   });

//   describe("Liquidation", function () {
//     it("Should allow liquidation of undercollateralized position", async function () {
//       const {
//         dscEngine,
//         priceOracle,
//         ethUsdPriceFeed,
//         lender,
//         borrower,
//         liquidator,
//       } = await loadFixture(deployContractsFixture);

//       // Lender deposits stablecoin
//       const lenderDepositAmount = ethers.utils.parseEther("10000");
//       await dscEngine.connect(lender).depositStablecoin(lenderDepositAmount);

//       // Borrower deposits collateral
//       const collateralAmount = ethers.utils.parseEther("1");
//       await dscEngine
//         .connect(borrower)
//         .depositCollateral({ value: collateralAmount });

//       // Borrower borrows max amount
//       const maxBorrowableAmount = await dscEngine
//         .connect(borrower)
//         .getMaxBorrowableAmount();
//       await dscEngine.connect(borrower).borrowStablecoin(maxBorrowableAmount);

//       // Drop ETH price to make position undercollateralized
//       await ethUsdPriceFeed.updateAnswer(ethers.utils.parseUnits("1000", 8)); // $1000 per ETH

//       // Check if borrower can be liquidated
//       const canBeLiquidated = await dscEngine.canUserBeLiquidated(
//         borrower.address
//       );
//       expect(canBeLiquidated).to.be.true;

//       // Liquidator liquidates position
//       const liquidationAmount = maxBorrowableAmount.div(2);
//       await expect(
//         dscEngine
//           .connect(liquidator)
//           .liquidate(borrower.address, liquidationAmount)
//       ).to.emit(dscEngine, "Liquidation");

//       // Check if debt is reduced
//       const debtAfterLiquidation = await dscEngine.getDebtBalance(
//         borrower.address
//       );
//       expect(debtAfterLiquidation).to.be.lt(maxBorrowableAmount);
//     });

//     it("Should revert liquidation if position is healthy", async function () {
//       const { dscEngine, lender, borrower, liquidator } = await loadFixture(
//         deployContractsFixture
//       );

//       // Lender deposits stablecoin
//       const lenderDepositAmount = ethers.utils.parseEther("10000");
//       await dscEngine.connect(lender).depositStablecoin(lenderDepositAmount);

//       // Borrower deposits collateral
//       const collateralAmount = ethers.utils.parseEther("1");
//       await dscEngine
//         .connect(borrower)
//         .depositCollateral({ value: collateralAmount });

//       // Borrower borrows conservatively
//       const maxBorrowableAmount = await dscEngine
//         .connect(borrower)
//         .getMaxBorrowableAmount();
//       const conservativeBorrowAmount = maxBorrowableAmount.div(2);
//       await dscEngine
//         .connect(borrower)
//         .borrowStablecoin(conservativeBorrowAmount);

//       // Position should be healthy
//       const canBeLiquidated = await dscEngine.canUserBeLiquidated(
//         borrower.address
//       );
//       expect(canBeLiquidated).to.be.false;

//       // Try to liquidate
//       await expect(
//         dscEngine
//           .connect(liquidator)
//           .liquidate(borrower.address, conservativeBorrowAmount)
//       ).to.be.revertedWith("User is not undercollaterized");
//     });
//   });

//   describe("View Functions", function () {
//     it("Should correctly calculate health factor", async function () {
//       const { dscEngine, lender, borrower } = await loadFixture(
//         deployContractsFixture
//       );

//       // Lender deposits stablecoin
//       const lenderDepositAmount = ethers.utils.parseEther("10000");
//       await dscEngine.connect(lender).depositStablecoin(lenderDepositAmount);

//       // Borrower deposits collateral
//       const collateralAmount = ethers.utils.parseEther("1");
//       await dscEngine
//         .connect(borrower)
//         .depositCollateral({ value: collateralAmount });

//       // Before borrowing, health factor should be max
//       const initialHealthFactor = await dscEngine.getHealthFactor(
//         borrower.address
//       );
//       expect(initialHealthFactor).to.equal(ethers.constants.MaxUint256);

//       // Borrow some amount
//       const borrowAmount = ethers.utils.parseEther("1000");
//       await dscEngine.connect(borrower).borrowStablecoin(borrowAmount);

//       // After borrowing, health factor should be finite
//       const healthFactorAfterBorrow = await dscEngine.getHealthFactor(
//         borrower.address
//       );
//       expect(healthFactorAfterBorrow).to.be.lt(ethers.constants.MaxUint256);
//       expect(healthFactorAfterBorrow).to.be.gt(ethers.utils.parseEther("1")); // Health factor > 1
//     });

//     it("Should correctly calculate max borrowable amount", async function () {
//       const { dscEngine, lender, borrower } = await loadFixture(
//         deployContractsFixture
//       );

//       // Lender deposits stablecoin
//       const lenderDepositAmount = ethers.utils.parseEther("10000");
//       await dscEngine.connect(lender).depositStablecoin(lenderDepositAmount);

//       // No collateral, max borrowable should be 0
//       const initialMaxBorrowable = await dscEngine
//         .connect(borrower)
//         .getMaxBorrowableAmount();
//       expect(initialMaxBorrowable).to.equal(0);

//       // Deposit collateral
//       const collateralAmount = ethers.utils.parseEther("1");
//       await dscEngine
//         .connect(borrower)
//         .depositCollateral({ value: collateralAmount });

//       // Now should have borrowable amount
//       const maxBorrowableAfterCollateral = await dscEngine
//         .connect(borrower)
//         .getMaxBorrowableAmount();
//       expect(maxBorrowableAfterCollateral).to.be.gt(0);

//       // Borrow max amount
//       await dscEngine
//         .connect(borrower)
//         .borrowStablecoin(maxBorrowableAfterCollateral);

//       // New max borrowable should be 0
//       const maxBorrowableAfterMaxBorrow = await dscEngine
//         .connect(borrower)
//         .getMaxBorrowableAmount();
//       expect(maxBorrowableAfterMaxBorrow).to.equal(0);
//     });

//     it("Should correctly calculate max withdrawable collateral", async function () {
//       const { dscEngine, lender, borrower } = await loadFixture(
//         deployContractsFixture
//       );

//       // Deposit collateral
//       const collateralAmount = ethers.utils.parseEther("1");
//       await dscEngine
//         .connect(borrower)
//         .depositCollateral({ value: collateralAmount });

//       // No debt, max withdrawable should be full collateral
//       const initialMaxWithdrawable = await dscEngine
//         .connect(borrower)
//         .getMaxWithdrawableCollateral();
//       expect(initialMaxWithdrawable).to.equal(collateralAmount);

//       // Lender deposits stablecoin
//       const lenderDepositAmount = ethers.utils.parseEther("10000");
//       await dscEngine.connect(lender).depositStablecoin(lenderDepositAmount);

//       // Borrow some amount
//       const borrowAmount = ethers.utils.parseEther("1000");
//       await dscEngine.connect(borrower).borrowStablecoin(borrowAmount);

//       // Now max withdrawable should be less than full collateral
//       const maxWithdrawableAfterBorrow = await dscEngine
//         .connect(borrower)
//         .getMaxWithdrawableCollateral();
//       expect(maxWithdrawableAfterBorrow).to.be.lt(collateralAmount);
//     });
//   });

//   describe("Interest Calculation", function () {
//     it("Should accrue interest on debt over time", async function () {
//       const { dscEngine, interestRateModel, lender, borrower } =
//         await loadFixture(deployContractsFixture);

//       // Lender deposits stablecoin
//       const lenderDepositAmount = ethers.utils.parseEther("10000");
//       await dscEngine.connect(lender).depositStablecoin(lenderDepositAmount);

//       // Borrower deposits collateral
//       const collateralAmount = ethers.utils.parseEther("1");
//       await dscEngine
//         .connect(borrower)
//         .depositCollateral({ value: collateralAmount });

//       // Borrower borrows stablecoin
//       const borrowAmount = ethers.utils.parseEther("1000");
//       await dscEngine.connect(borrower).borrowStablecoin(borrowAmount);

//       // Initial accrued interest should be 0 or very small
//       const initialInterest = await dscEngine
//         .connect(borrower)
//         .getYourAccruedDebtInterest();

//       // Skip forward in time to accrue interest
//       await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 30]); // 30 days
//       await ethers.provider.send("evm_mine");

//       // Check accrued interest
//       const accruedInterest = await dscEngine
//         .connect(borrower)
//         .getYourAccruedDebtInterest();
//       expect(accruedInterest).to.be.gt(initialInterest);
//     });

//     it("Should accrue interest on deposits over time", async function () {
//       const { dscEngine, interestRateModel, lender } = await loadFixture(
//         deployContractsFixture
//       );

//       // Lender deposits stablecoin
//       const lenderDepositAmount = ethers.utils.parseEther("10000");
//       await dscEngine.connect(lender).depositStablecoin(lenderDepositAmount);

//       // Initial accrued interest should be 0 or very small
//       const initialInterest = await dscEngine
//         .connect(lender)
//         .getYourEarnedLendingInterest();

//       // Skip forward in time to accrue interest
//       await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 30]); // 30 days
//       await ethers.provider.send("evm_mine");

//       // Check accrued interest
//       const accruedInterest = await dscEngine
//         .connect(lender)
//         .getYourEarnedLendingInterest();
//       expect(accruedInterest).to.be.gt(initialInterest);
//     });
//   });
// });
