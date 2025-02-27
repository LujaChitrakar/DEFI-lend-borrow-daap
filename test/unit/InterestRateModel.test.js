const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InterestRateModel", function () {
  let interestRateModel;
  let owner;
  let borrower;
  let lender;

  const PRINCIPAL_AMOUNT = ethers.parseEther("1000"); // 1000 tokens
  const LENDER_INTEREST_RATE = 500; // 5%
  const BORROWER_INTEREST_RATE = 700; // 7%
  const RATE_PRECISION = 10000; // 1e4
  const SECONDS_IN_YEAR = 365 * 24 * 60 * 60;

  beforeEach(async function () {
    // Deploy InterestRateModel
    const InterestRateModel = await ethers.getContractFactory(
      "InterestRateModel"
    );
    [owner, borrower, lender] = await ethers.getSigners();
    interestRateModel = await InterestRateModel.deploy();

    // Initialize timestamps for borrower and lender
    // This is needed since _calculateInterest requires a previous timestamp
    const tx1 = await interestRateModel.resetInterest(borrower.address);
    await tx1.wait();

    const tx2 = await interestRateModel.resetInterest(lender.address);
    await tx2.wait();

    // Set initial timestamps (we need to do this via a transaction to change state)
    // We're using a custom function for testing to set initial timestamps
    const setInitialTimestampTx =
      await interestRateModel.testSetInitialTimestamp(borrower.address);
    await setInitialTimestampTx.wait();

    const setInitialTimestampTx2 =
      await interestRateModel.testSetInitialTimestamp(lender.address);
    await setInitialTimestampTx2.wait();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await interestRateModel.owner()).to.equal(owner.address);
    });

    it("Should set the correct constants", async function () {
      expect(await interestRateModel.SECONDS_IN_YEAR()).to.equal(
        SECONDS_IN_YEAR
      );
      expect(await interestRateModel.RATE_PRECISION()).to.equal(RATE_PRECISION);
    });
  });

  describe("Interest Calculation and Accrual", function () {
    it("Should accrue borrower interest correctly", async function () {
      // Fast forward time by 30 days
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      // Accrue interest for borrower
      await interestRateModel.accureInterest(
        borrower.address,
        PRINCIPAL_AMOUNT,
        false
      );

      // Calculate expected interest (approximately 30 days of 7% annual rate)
      const timeElapsed = BigInt(30 * 24 * 60 * 60);
      const expectedInterest =
        (PRINCIPAL_AMOUNT * BigInt(BORROWER_INTEREST_RATE) * timeElapsed) /
        (BigInt(RATE_PRECISION) * BigInt(SECONDS_IN_YEAR));

      const accruedInterest = await interestRateModel.getAccuredInterest(
        borrower.address
      );

      // Allow for some small block timestamp variation
      const tolerance = ethers.parseEther("0.1"); // Small tolerance for block timing variations
      expect(accruedInterest).to.be.closeTo(expectedInterest, tolerance);
    });

    it("Should accrue lender interest correctly", async function () {
      // Fast forward time by 60 days
      await ethers.provider.send("evm_increaseTime", [60 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      // Accrue interest for lender
      await interestRateModel.accureInterest(
        lender.address,
        PRINCIPAL_AMOUNT,
        true
      );

      // Calculate expected interest (approximately 60 days of 5% annual rate)
      const timeElapsed = BigInt(60 * 24 * 60 * 60);
      const expectedInterest =
        (PRINCIPAL_AMOUNT * BigInt(LENDER_INTEREST_RATE) * timeElapsed) /
        (BigInt(RATE_PRECISION) * BigInt(SECONDS_IN_YEAR));

      const accruedInterest = await interestRateModel.getAccuredInterest(
        lender.address
      );

      const tolerance = ethers.parseEther("0.1");
      expect(accruedInterest).to.be.closeTo(expectedInterest, tolerance);
    });

    it("Should emit InterestAccured event", async function () {
      // Fast forward time by 10 days
      await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      // First capture the transaction
      const tx = await interestRateModel.accureInterest(
        borrower.address,
        PRINCIPAL_AMOUNT,
        false
      );
      const receipt = await tx.wait();

      // Verify the event was emitted
      const interestAccuredEvents = receipt.logs.filter(
        (log) => log.fragment && log.fragment.name === "InterestAccured"
      );

      expect(interestAccuredEvents.length).to.equal(1);
      expect(interestAccuredEvents[0].args[0]).to.equal(borrower.address);
      // We verify that some interest amount was emitted (greater than 0)
      expect(interestAccuredEvents[0].args[1]).to.be.gt(0);
    });

    it("Should update the lastInterestTimestamp", async function () {
      const beforeTimestamp = await interestRateModel.getLastInterestTimeStamp(
        borrower.address
      );

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [1000]);
      await ethers.provider.send("evm_mine");

      // Accrue interest
      await interestRateModel.accureInterest(
        borrower.address,
        PRINCIPAL_AMOUNT,
        false
      );

      const afterTimestamp = await interestRateModel.getLastInterestTimeStamp(
        borrower.address
      );
      expect(afterTimestamp).to.be.greaterThan(beforeTimestamp);
    });

    it("Should accumulate interest over multiple calls", async function () {
      // First interest accrual
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      await interestRateModel.accureInterest(
        borrower.address,
        PRINCIPAL_AMOUNT,
        false
      );

      const firstInterest = await interestRateModel.getAccuredInterest(
        borrower.address
      );

      // Second interest accrual
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      await interestRateModel.accureInterest(
        borrower.address,
        PRINCIPAL_AMOUNT,
        false
      );

      const secondInterest = await interestRateModel.getAccuredInterest(
        borrower.address
      );

      // Second interest should be greater than first interest
      expect(secondInterest).to.be.greaterThan(firstInterest);
    });
  });

  describe("Interest Reset", function () {
    it("Should reset accrued interest to zero", async function () {
      // Accrue some interest
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      await interestRateModel.accureInterest(
        borrower.address,
        PRINCIPAL_AMOUNT,
        false
      );

      // Verify interest has accrued
      const accruedInterest = await interestRateModel.getAccuredInterest(
        borrower.address
      );
      expect(accruedInterest).to.be.greaterThan(0);

      // Reset interest
      await interestRateModel.resetInterest(borrower.address);

      // Verify interest is reset to zero
      const resetInterest = await interestRateModel.getAccuredInterest(
        borrower.address
      );
      expect(resetInterest).to.equal(0);
    });
  });

  describe("Input Validation", function () {
    it("Should revert when principal is zero", async function () {
      await expect(
        interestRateModel.accureInterest(borrower.address, 0, false)
      ).to.be.revertedWith("Principal must be greater than zero");
    });

    // it("Should revert when calculating interest without previous timestamp", async function () {
    //   // Create a new address that has no previous timestamp
    //   const newUser = ethers.Wallet.createRandom().address;

    //   await expect(
    //     interestRateModel.accureInterest(newUser, PRINCIPAL_AMOUNT, false)
    //   ).to.be.revertedWith("No prevvious timestamp");
    // });
  });
});
