const { ethers } = require("hardhat");

async function depositMockStablecoin() {
  // Contract addresses and amounts
  const DSC_ENGINE_ADDRESS = "0x..."; // Your DSCEngine contract address
  const MOCK_USDC_ADDRESS = "0x..."; // Your mock USDC token address
  const AMOUNT_TO_DEPOSIT = ethers.utils.parseUnits("1000", 6); // 1000 USDC (6 decimals)

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Depositing with account:", deployer.address);

  // Get contract instances
  const dscEngine = await ethers.getContractAt("DSCEngine", DSC_ENGINE_ADDRESS);
  const mockUSDC = await ethers.getContractAt("ERC20", MOCK_USDC_ADDRESS);

  // Check balances before
  const balanceBefore = await mockUSDC.balanceOf(deployer.address);
  console.log(
    "USDC balance before:",
    ethers.utils.formatUnits(balanceBefore, 6)
  );

  // If using a mock token, mint some tokens first (if your mock allows it)
  // Uncomment if your mock token has a mint function
  // const mintTx = await mockUSDC.mint(deployer.address, AMOUNT_TO_DEPOSIT);
  // await mintTx.wait();
  // console.log("Minted mock USDC");

  // Approve DSCEngine to spend USDC
  console.log("Approving tokens...");
  const approveTx = await mockUSDC.approve(
    DSC_ENGINE_ADDRESS,
    AMOUNT_TO_DEPOSIT
  );
  await approveTx.wait();
  console.log("Approved DSCEngine to spend USDC");

  // Deposit to the contract
  // Note: Based on your contract, you might need to modify this call
  // to match your actual function for depositing stablecoin
  console.log("Depositing tokens...");
  const depositTx = await dscEngine.depositStablecoin(AMOUNT_TO_DEPOSIT);
  await depositTx.wait();

  // Check balances after
  const balanceAfter = await mockUSDC.balanceOf(deployer.address);
  console.log("USDC balance after:", ethers.utils.formatUnits(balanceAfter, 6));

  // Check contract balance
  const contractBalance = await mockUSDC.balanceOf(DSC_ENGINE_ADDRESS);
  console.log(
    "Contract USDC balance:",
    ethers.utils.formatUnits(contractBalance, 6)
  );

  console.log("Deposit completed successfully");
}

// Execute the script
depositMockStablecoin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
