const { ethers, network } = require("hardhat");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  const interestRateModel = await ethers.deployContract("InterestRateModel");
  await interestRateModel.waitForDeployment();
  const interestRateModelAddress = await interestRateModel.getAddress();
  console.log("Interest Rate Model deployed to:", interestRateModelAddress);

  const usdc = await ethers.deployContract("USDCToken");
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("USDC Token deployed to:", usdcAddress);

  const priceOracle = await ethers.deployContract("PriceOracle");
  await priceOracle.waitForDeployment();
  const priceOracleAddress = await priceOracle.getAddress();
  console.log("priceOracle deployed to:", priceOracleAddress);

  const dscEngine = await ethers.deployContract("DSCEngine", [
    priceOracleAddress,
    interestRateModelAddress,
    usdcAddress,
  ]);
  await dscEngine.waitForDeployment();
  console.log("DSCEngine deployed to:", dscEngine.target);

  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for 5 confirmations before verifying...");

    await dscEngine.deploymentTransaction().wait(5); // Wait for 5 confirmations
    console.log("Verifying contract...");

    await verify(priceOracle.target, []);
    await verify(interestRateModel.target, []);
    await verify(dscEngine.target, [
      priceOracle.target,
      interestRateModel.target,
      usdcAddress,
    ]);
  }
  console.log("Deployment complete");
  saveFrontendFiles(dscEngine.target);
}

async function verify(contractAddress, args) {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("already verified");
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
