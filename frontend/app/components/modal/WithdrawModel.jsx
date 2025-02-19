// WithdrawModal.jsx
'use client';

import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DefiContext } from "../../context/DefiContext";
import { X } from "lucide-react";
import { ethers } from "ethers";

const USDC_ADDRESS = "0x76eFc6B7aDac502DC210f255ea8420672C1355d3";

const WithdrawModal = () => {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState("");
  const [withdrawableBalance, setWithdrawableBalance] = useState("0");
  const [loading, setLoading] = useState(false);

  const {
    openModalScreen,
    setOpenModalScreen,
    contract,
    userAddress,
    updateUserData,
  } = useContext(DefiContext);

  // Balance fetching logic
  useEffect(() => {
    setMounted(true);
    if (contract && userAddress) {
      fetchWithdrawableBalance();
    }
  }, [contract, userAddress]);

  const fetchWithdrawableBalance = async () => {
    try {
      const balance = await contract.getYourLendedStablecoin();
      setWithdrawableBalance(ethers.formatUnits(balance, 6));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !contract) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const amountInWei = ethers.parseUnits(amount, 6);
      
      const tx = await contract.withdrawStablecoin(amountInWei);
      await tx.wait();
      
      await updateUserData(contract, userAddress);
      setAmount("");
      setOpenModalScreen(null);
    } catch (error) {
      console.error("Withdrawal failed:", error);
      alert("Withdrawal failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(withdrawableBalance);
  };

  // Early return if not mounted or modal not active
  if (!mounted || openModalScreen !== "Withdraw") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-70">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-[500px] border border-gray-700">
        {/* Modal content */}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default WithdrawModal;