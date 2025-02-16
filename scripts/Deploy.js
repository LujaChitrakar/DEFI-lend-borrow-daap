const { ethers, network } = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  const helperConfig = await ethers.deployContract("HelperConfig");
  await helperConfig.waitForDeployment();
  console.log("Helper Config deployed to:", helperConfig.target);

  const networkConfig = await helperConfig.activenetworkConfig();

  let weth, wbtc, usdc, usdt;
  if (network.name === "hardhat" || network.name === "localhost") {
    const initialSupply = ethers.parseEther("10000000");

    weth = await ethers.deployContract("ERC20Mock", [
      "Wrapped ETH",
      "WETH",
      initialSupply,
    ]);
    wbtc = await ethers.deployContract("ERC20Mock", [
      "Wrapped BTC",
      "WBTC",
      initialSupply,
    ]);
    usdc = await ethers.deployContract("ERC20Mock", [
      "USD Coin",
      "USDC",
      initialSupply,
    ]);
    usdt = await ethers.deployContract("ERC20Mock", [
      "USD Tether",
      "USDT",
      initialSupply,
    ]);

    await weth.waitForDeployment();
    await wbtc.waitForDeployment();
    await usdc.waitForDeployment();
    await usdt.waitForDeployment();

    console.log("Mock tokens deployed:");
    console.log("WETH:", weth.target);
    console.log("WETH:", weth.target);
    console.log("WETH:", weth.target);
    console.log("WETH:", weth.target);
  }
}
