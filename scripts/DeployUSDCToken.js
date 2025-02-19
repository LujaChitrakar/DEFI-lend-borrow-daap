const { ethers, network, run } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Starting USDC Token deployment...");

  const usdcToken = await ethers.deployContract("USDCToken");
  await usdcToken.waitForDeployment();

  console.log("USDC Token deployed to:", usdcToken.target);

  const helperConfig = await ethers.deployContract("HelperConfig");
  await helperConfig.waitForDeployment();
  console.log("Helper Config deployed to:", helperConfig.target);

  const networkConfig = await helperConfig.activeNetworkConfig();
  priceOracle = await ethers.deployContract("PriceOracle");
  await priceOracle.waitForDeployment();
  console.log("priceOracle deployed to:", priceOracle.target);

  await priceOracle.setPriceFeed(
    usdcToken.target,
    networkConfig.usdcUsdPriceFeed
  );
  console.log("Price Feed set in PriceOracle");

  await priceOracle.setEthPriceFeed(networkConfig.ethUsdPriceFeed);
  console.log("ETH Price Feed set in PriceOracle");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const mintAmount = ethers.parseEther("1000000", 6);
  const mintTx = await usdcToken.mint(
    "0xe1fa35699020c8c6539edd502755bc06e25791cc",
    mintAmount
  );
  await mintTx.wait();

  console.log(`Minted ${mintAmount} USDC to deployer`);

  // Wait for 5 confirmations before verification
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for 5 confirmations before verifying...");
    await usdcToken.deploymentTransaction().wait(5); // Ensures it propagates
    console.log("Verifying contract...");

    await verify(usdcToken.target, []);
  }

  console.log("Deployment complete!");
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
      console.log("Verification failed:", e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
