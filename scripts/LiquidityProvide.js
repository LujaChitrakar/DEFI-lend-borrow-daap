const { ethers } = require("hardhat");

async function depositStablecoin(amount) {
  const USDCContractAddress = "0x38e92e887AA4C802aD70491Df59286EaaBd14a73";
  const dscContractAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

  const [deployer] = await ethers.getSigners(); // Ensure the deployer is the owner

  // Attach to the deployed contract
  const dsc = await ethers.getContractAt(
    "DSCEngine",
    dscContractAddress,
    deployer
  );

  // Convert amount to correct format
  const liquidityAmount = ethers.parseUnits(amount.toString(), 18);

  //   console.log(`Minting ${amount} USDC to ${walletAddress}...`);

  // Call mint function
  const tx = await dsc.depositStablecoin(USDCContractAddress, liquidityAmount);
  await tx.wait();

  console.log(`✅ Liquidity Provided successful! TX Hash: ${tx.hash}`);
}

// Run the script
depositStablecoin("10000")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Liquidity provided failed:", error);
    process.exit(1);
  });
