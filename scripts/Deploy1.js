const { ethers, network } = require("hardhat");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  const interestRateModel = await ethers.deployContract("InterestRateModel");
  await interestRateModel.waitForDeployment();
  console.log("Interest Rate Model deployed to:", interestRateModel.target);

  priceOracle = await ethers.deployContract("PriceOracle");
  await priceOracle.waitForDeployment();
  console.log("priceOracle deployed to:", priceOracle.target);

  const dscEngine = await ethers.deployContract("DSCEngine", [
    priceOracle.target,
    interestRateModel.target,
  ]);
  await dscEngine.waitForDeployment();
  console.log("DSCEngine deployed to:", dscEngine.target);

  // const [deployer] = await ethers.getSigners();

  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for 5 confirmations before verifying...");

    await dscEngine.deploymentTransaction().wait(5); // Wait for 5 confirmations
    console.log("Verifying contract...");

    await verify(priceOracle.target, []);
    await verify(interestRateModel.target, []);
    await verify(dscEngine.target, [
      priceOracle.target,
      interestRateModel.target,
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
