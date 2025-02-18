const { ethers, network } = require("hardhat");
const path = require("path");

async function main() {
  console.log("Starting deployment...");
  const USDCToken = await ethers.getContractFactory("USDCToken");

  const usdcToken = await USDCToken.deploy();
  await usdcToken.waitForDeployment();

  console.log("USDC Token deployed to:", usdcToken.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
