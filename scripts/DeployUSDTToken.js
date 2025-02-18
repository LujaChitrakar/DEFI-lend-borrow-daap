const { ethers, network } = require("hardhat");
const path = require("path");

async function main() {
  console.log("Starting deployment...");
  const USDTToken = await ethers.getContractFactory("USDTToken");

  const usdtToken = await USDTToken.deploy();
  await usdtToken.waitForDeployment();

  console.log("USDT Token deployed to:", usdtToken.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
