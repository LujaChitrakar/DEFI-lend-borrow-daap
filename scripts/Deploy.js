// scripts/deploy.js
const { ethers, network, artifacts, run } = require("hardhat");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  // Deploy the DeFiLending contract
  const defiLending = await ethers.deployContract("DeFiLending");
  await defiLending.waitForDeployment();
  console.log("DeFiLending deployed to:", defiLending.target);

  // If on a live network, verify
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for 5 confirmations before verifying...");
    await defiLending.deploymentTransaction().wait(5);
    console.log("Verifying contract...");

    await verify(defiLending.target, []);
  }

  console.log("Deployment complete");
  saveFrontendFiles(defiLending.target);
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
      console.error(e);
    }
  }
}

function saveFrontendFiles(contractAddress) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ DeFiLending: contractAddress }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync("DeFiLending");

  fs.writeFileSync(
    path.join(contractsDir, "DeFiLending.json"),
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
