const { ethers, network } = require("hardhat");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  const helperConfig = await ethers.deployContract("HelperConfig");
  await helperConfig.waitForDeployment();
  console.log("Helper Config deployed to:", helperConfig.target);

  const networkConfig = await helperConfig.activeNetworkConfig();

  let usdc, usdt;
  const initialSupply = ethers.parseEther("10000000");

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

  await usdc.waitForDeployment();
  await usdt.waitForDeployment();

  console.log("Mock tokens deployed:");
  console.log("USDC:", usdc.target);
  console.log("USDT:", usdt.target);

  priceOracle = await ethers.deployContract("PriceOracle");
  await priceOracle.waitForDeployment();
  console.log("priceOracle deployed to:", priceOracle.target);

  await priceOracle.setPriceFeed(usdc.target, networkConfig.usdcUsdPriceFeed);
  await priceOracle.setPriceFeed(usdt.target, networkConfig.usdtUsdPriceFeed);
  console.log("Price Feed set in PriceOracle");

  const interestRateModel = await ethers.deployContract("InterestRateModel");
  await interestRateModel.waitForDeployment();
  console.log("Interest Rate Model deployed to:", interestRateModel.target);

  const lendingToken = await ethers.deployContract("LendingToken");
  await lendingToken.waitForDeployment();
  console.log("Lending token deployed to:", lendingToken.target);

  const dscEngine = await ethers.deployContract("DSCEngine", [
    priceOracle.target,
    lendingToken.target,
    interestRateModel.target,
    usdc.target,
    usdt.target,
  ]);
  await dscEngine.waitForDeployment();
  console.log("DSCEngine deployed to:", dscEngine.target);

  await lendingToken.transferOwnership(dscEngine.target);
  console.log("Lending token ownership transfered to DSCEngine");

  const [deployer] = await ethers.getSigners();
  const mintAmount = ethers.parseEther("100000");

  await usdc.mint(deployer.address, mintAmount);
  await usdt.mint(deployer.address, mintAmount);

  console.log("Minted test token for deployer");

  if (network.name != "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations");

    await Promise.all([
      dscEngine.deployTransaction.wait(6),
      usdc.deployTransaction.wait(6),
      usdt.deployTransaction.wait(6),
    ]);
    console.log("Verifying contract ....");

    await verify(usdc.target, ["USD Coin", "USDC", initialSupply]);
    await verify(usdt.target, ["USD Tether", "USDT", initialSupply]);
    await verify(priceOracle.target, []);
    await verify(lendingToken.target, []);
    await verify(interestRateModel.target, []);
    await verify(dscEngine.target, [
      priceOracle.target,
      lendingToken.target,
      interestRateModel.target,
      usdc.target,
      usdt.target,
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

  const PrimeOrNotArtifact = artifacts.readArtifactSync("DSCEngine");

  fs.writeFileSync(
    path.join(contractsDir, "DSCEngine.json"),
    JSON.stringify(PrimeOrNotArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
