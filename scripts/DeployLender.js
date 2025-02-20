const { ethers, network } = require("hardhat");
const path = require("path");

async function main() {
  console.log("Starting lender deployment and interaction setup...");

  // Deploy core contracts
  const interestRateModel = await ethers.deployContract("InterestRateModel");
  await interestRateModel.waitForDeployment();
  console.log("Interest Rate Model deployed to:", interestRateModel.target);

  const priceOracle = await ethers.deployContract("PriceOracle");
  await priceOracle.waitForDeployment();
  console.log("PriceOracle deployed to:", priceOracle.target);

  const dscEngine = await ethers.deployContract("DSCEngine", [
    priceOracle.target,
    interestRateModel.target,
  ]);
  await dscEngine.waitForDeployment();
  console.log("DSCEngine deployed to:", dscEngine.target);

  // Set up USDC token interaction
  const USDC_ADDRESS = "0x76eFc6B7aDac502DC210f255ea8420672C1355d3";
  const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);

  // Handle verification for non-local environments
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for 5 confirmations before verifying...");
    await dscEngine.deploymentTransaction().wait(5);
    console.log("Verifying contracts...");

    await verify(priceOracle.target, []);
    await verify(interestRateModel.target, []);
    await verify(dscEngine.target, [
      priceOracle.target,
      interestRateModel.target,
    ]);
  }

  // Set up lender script functionality
  console.log("\n--- LENDER INTERACTION SETUP ---");
  console.log("To use this deployment as a lender:");

  // 1. First approve USDC transfer to the protocol
  console.log("\nStep 1: Approve USDC transfer to the protocol");
  console.log(
    `const usdcToken = await ethers.getContractAt("IERC20", "${USDC_ADDRESS}");`
  );
  console.log(
    `const amount = ethers.parseUnits("1000", 6); // For 1000 USDC (adjust as needed)`
  );
  console.log(`await usdcToken.approve("${dscEngine.target}", amount);`);

  // 2. Deposit stablecoin to earn interes
  console.log("\nStep 2: Deposit stablecoin to earn interest");
  console.log(
    `const dscEngine = await ethers.getContractAt("DSCEngine", "${dscEngine.target}");`
  );
  console.log(`await dscEngine.depositStablecoin(amount);`);

  // 3. Check balance and accrued interest
  console.log("\nStep 3: Check your balance and accrued interest");
  console.log(
    `const depositBalance = await dscEngine.getYourLendedStablecoin();`
  );
  console.log(
    `console.log("Your deposit balance:", ethers.formatUnits(depositBalance, 6), "USDC");`
  );
  console.log(
    `const earnedInterest = await dscEngine.getYourEarnedLendingInterest();`
  );
  console.log(
    `console.log("Earned interest:", ethers.formatUnits(earnedInterest, 6), "USDC");`
  );

  // 4. Withdraw stablecoin with interest
  console.log("\nStep 4: Withdraw stablecoin with accrued interest");
  console.log(
    `const withdrawAmount = ethers.parseUnits("500", 6); // For 500 USDC (adjust as needed)`
  );
  console.log(`await dscEngine.withdrawStablecoin(withdrawAmount);`);

  // Save frontend files
  saveFrontendFiles(dscEngine.target);
  console.log("\nLender deployment and setup complete!");
}

async function verify(contractAddress, args) {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified");
    } else {
      console.log(e);
    }
  }
}

function saveFrontendFiles(contract_address) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ DSCEngine: contract_address }, undefined, 2)
  );

  const DefiArtifact = artifacts.readArtifactSync("DSCEngine");

  fs.writeFileSync(
    path.join(contractsDir, "DSCEngine.json"),
    JSON.stringify(DefiArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
