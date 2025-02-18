"use client";

import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DefiContext } from "../../context/DefiContext";
import { X } from "lucide-react";

const BorrowModal = () => {
  const { openModalScreen, setOpenModalScreen } = useContext(DefiContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

        {/* Network Switch Warning */}
        <div className="bg-red-900/70 text-red-300 p-3 rounded-lg text-sm flex justify-between items-center mb-5">
          <span>Please switch to Ethereum Sepolia.</span>
          <button className="text-red-400 font-semibold hover:underline">Switch</button>
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
            <span className="text-gray-400">USDT</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Available to Borrow: 1500 USDT</span>
            <button className="text-blue-400 hover:text-blue-500 transition">MAX</button>
          </div>
        </div>

        {/* Transaction Overview */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 my-5">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Borrow APY</span> 
            <span className="text-white">3.1%</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>Health Factor</span> 
            <span className="text-yellow-400 font-medium">Stable</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="w-full bg-gray-700 text-gray-500 px-4 py-3 rounded-lg cursor-not-allowed transition"
          disabled
        >
          Borrow
        </button>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default BorrowModal;
