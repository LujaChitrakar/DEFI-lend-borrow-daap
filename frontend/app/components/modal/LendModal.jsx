"use client";
import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DefiContext } from "../../context/DefiContext";
import { X } from "lucide-react";
import { ethers } from "ethers";

const LendModal = () => {
  const USDC_ADDRESS = "0x76eFc6B7aDac502DC210f255ea8420672C1355d3";

  const {
    openModalScreen,
    setOpenModalScreen,
    contract,
    userAddress,
    updateUserData,
  } = useContext(DefiContext);
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [usdValue, setUsdValue] = useState("0.00");
  const [lendingStats, setLendingStats] = useState({
    totalSupply: "0",
    userLendBalance: "0",
    earnedInterest: "0",
    apy: "5",
  });

  useEffect(() => {
    setMounted(true);
    if (contract && userAddress) {
      fetchWalletBalance();
      fetchLendingStats();
    }
  }, [userAddress, contract]);

  const fetchLendingStats = async () => {
    try {
      const [totalSupply, userLendBalance, earnedInterest] = await Promise.all([
        contract.getTotalStablecoinInPool(),
        contract.getYourLendedStablecoin(),
        contract.getYourEarnedLendingInterest(),
      ]);

      setLendingStats({
        totalSupply: ethers.formatEther(totalSupply),
        userLendBalance: ethers.formatEther(userLendBalance),
        earnedInterest: ethers.formatEther(earnedInterest),
        apy: "5",
      });
    } catch (error) {
      console.error("Error fetching lending stats:", error);
    }
  };

  const fetchWalletBalance = async () => {
    if (!window.ethereum || !userAddress) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      ["function balanceOf(address owner) view returns (uint256)"],
      signer
    );

    const balance = await usdcContract.balanceOf(userAddress);
    setWalletBalance(ethers.formatUnits(balance, 6)); // USDC has 6 decimals
  };

  const handleLend = async () => {
    if (!amount || !contract) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const usdcContract = new ethers.Contract(
        USDC_ADDRESS,
        [
          "function approve(address spender, uint256 amount) public returns (bool)",
        ],
        signer
      );

      // Convert amount to 6 decimal format for USDC
      const amountInWei = ethers.parseUnits(amount, 6);

      // Step 1: Approve the contract to spend USDC
      const approveTx = await usdcContract.approve(
        contract.target,
        amountInWei
      );
      await approveTx.wait(); // Wait for the approval to be confirmed

      // Step 2: Call depositStablecoin
      const tx = await contract.depositStablecoin(amountInWei);
      await tx.wait(); // Wait for the deposit transaction to be confirmed

      // Refresh user data and lending stats
      await Promise.all([
        updateUserData(contract, userAddress),
        fetchLendingStats(),
        fetchWalletBalance(),
      ]);

      setAmount("");
      setUsdValue("0.00");
      setOpenModalScreen(null);
    } catch (error) {
      console.log("Lending failed:", {
        amount,
        error: error.message,
        chainId: await window.ethereum.request({ method: "eth_chainId" }),
      });
      alert("Lending failed. Please check your wallet and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMaxClick = () => {
    const maxAmount =
      parseFloat(walletBalance) > 0.01
        ? (parseFloat(walletBalance) - 0.01).toFixed(18)
        : "0";
    setAmount(maxAmount);
    setUsdValue((parseFloat(maxAmount) * 3000).toFixed(2));
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || parseFloat(value) >= 0) {
      setAmount(value);
      setUsdValue((parseFloat(value) || 0) * 3000);
    }
  };

  if (!mounted || openModalScreen !== "Lend") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-70">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-[500px] border border-gray-700">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-white">Supply USDC</h2>
          <button
            onClick={() => setOpenModalScreen(null)}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Total Supply</p>
              <p className="text-white">
                {parseFloat(lendingStats.totalSupply).toFixed(4)} USDC
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Your Lending</p>
              <p className="text-white">
                {parseFloat(lendingStats.userLendBalance).toFixed(4)} USDC
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Earned Interest</p>
              <p className="text-green-400">
                {parseFloat(lendingStats.earnedInterest).toFixed(4)} USDC
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-gray-400 text-sm">Amount</label>
          <div className="flex items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              min="0"
              step="0.000000000000000001"
              className="bg-transparent flex-grow outline-none text-white placeholder-gray-500"
            />
            <span className="text-gray-400">USDC</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex flex-col">
              <span>${usdValue}</span>
              <span>Balance: {parseFloat(walletBalance).toFixed(4)} USDC</span>
            </div>
            <button
              onClick={handleMaxClick}
              className="text-blue-400 hover:text-blue-500 transition"
            >
              MAX
            </button>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 my-5">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Supply APY</span>
            <span className="text-white">{lendingStats.apy}%</span>
          </div>
        </div>
        <button
          onClick={handleLend}
          disabled={loading || !amount || !contract || parseFloat(amount) <= 0}
          className={`w-full px-4 py-3 rounded-lg transition ${
            loading || !amount || parseFloat(amount) <= 0
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {loading ? "Processing..." : "Lend"}
        </button>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default LendModal;