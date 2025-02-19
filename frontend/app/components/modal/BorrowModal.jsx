"use client";

import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DefiContext } from "../../context/DefiContext";
import { X } from "lucide-react";
import { ethers } from "ethers";

const BorrowModal = () => {
  const { openModalScreen, setOpenModalScreen,currentState } = useContext(DefiContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBorrow =async()=>{
    const res= await  currentState.contract?.depositCollateralAndBorrowStablecoin({value:ethers.parseEther("0.00015")})
    // const res= await  currentState.contract?.depositCollateralAndBorrowStablecoin({value:1000000000000000000})
    
    console.log(res)
    
      }

  if (!mounted || openModalScreen !== "Borrow") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-[400px] border border-gray-700">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-white">Borrow Asset</h2>
          <button
            onClick={() => setOpenModalScreen(null)}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-gray-400 text-sm">Amount</label>
          <div className="flex items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
            <input
              type="number"
              placeholder="0.00"
              className="bg-transparent flex-grow outline-none text-white placeholder-gray-500"
            />
            <span className="text-gray-400">USDC</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Available to Borrow: 1500 USDC</span>
            <button className="text-blue-400 hover:text-blue-500 transition">MAX</button>
          </div>
        </div>

        {/* Transaction Overview */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 my-5">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Borrow APY</span> 
            <span className="text-white">7%</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>Health Factor</span> 
            <span className="text-yellow-400 font-medium">Stable</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          // className="w-full bg-gray-700 text-gray-500 px-4 py-3 rounded-lg cursor-not-allowed transition"
          className="w-full bg-gray-700 text-gray-500 px-4 py-3 rounded-lg transition"
        onClick={handleBorrow}
       >
          Borrow
        </button>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default BorrowModal;
