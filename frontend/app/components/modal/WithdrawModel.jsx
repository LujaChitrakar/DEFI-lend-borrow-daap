"use client";
import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DefiContext } from "../../context/DefiContext";
import { X } from "lucide-react";
import { ethers } from "ethers";

const WithdrawModal = () => {
  const USDC_ADDRESS = "0x76eFc6B7aDac502DC210f255ea8420672C1355d3";

  const {
    openModalScreen,
    setOpenModalScreen,
    currentState,
setTotalLend,
setTotalLendingTokens,
setTokensToLend
  } = useContext(DefiContext);

 
  const [amount, setAmount] = useState("");
  const [withdrawableBalance, setWithdrawableBalance] = useState("0");
 

 const handleWithdraw = async () => {
  try {
    setOpenModalScreen("LoadingScreen");

    const res = await currentState.contract?.withdrawStablecoin(parseInt(amount));
    
    if (res) {
      await res.wait(); 

      const updatedLendedStablecoin = await currentState.contract?.getYourLendedStablecoin();
      const updatedLendedStablecoinInPool=  await currentState.contract?.getTotalStablecoinInPool();
      
      setTotalLend((prev) => [{ ...prev[0], available: updatedLendedStablecoin }]);
      setTotalLendingTokens((prev)=>{return [{...prev[0],available:updatedLendedStablecoinInPool}]})   
      setTokensToLend((prev)=>{return [{...prev[0],available:updatedLendedStablecoinInPool}]})   
      setOpenModalScreen(null); 
    }
  } catch (error) {
    console.error("Withdrawal failed:", error);
    setOpenModalScreen(null); 
  }
};

  const handleMaxClick = () => {
    setAmount(withdrawableBalance);
  };

  if ( openModalScreen !== "Withdraw") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-70">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-[500px] border border-gray-700">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-white">Withdraw USDC</h2>
          <button
            onClick={() => setOpenModalScreen(null)}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-gray-400 text-sm">Amount</label>
          <div className="flex items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              className="bg-transparent flex-grow outline-none text-white placeholder-gray-500"
            />
            <span className="text-gray-400">USDC</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>
              Available: {parseFloat(withdrawableBalance).toFixed(4)} USDC
            </span>
            <button
              onClick={handleMaxClick}
              className="text-blue-400 hover:text-blue-500 transition"
            >
              MAX
            </button>
          </div>
        </div>

        <button
          onClick={handleWithdraw}
       
          className={`w-full px-4 py-3 rounded-lg transition mt-4 ${
            !amount ||
            parseFloat(amount) <= 0 
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
        Withdraw
        </button>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default WithdrawModal;
