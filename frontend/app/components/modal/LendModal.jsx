"use client";

import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DefiContext } from "../../context/DefiContext";
import { X } from "lucide-react";

const LendModal = () => {
  const { openModalScreen, setOpenModalScreen } = useContext(DefiContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || openModalScreen !== "Lend") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-70">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-[500px] border border-gray-700">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-white">Supply ETH</h2>
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
            <span className="text-gray-400">ETH</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Wallet balance: 0.996216</span>
            <button className="text-blue-400 hover:text-blue-500 transition">MAX</button>
          </div>
        </div>

        {/* Transaction Overview */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 my-5">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Supply APY</span> 
            <span className="text-white">5%</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>Collateralization</span> 
            <span className="text-green-400 font-medium">Enabled</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="w-full bg-gray-700 text-gray-500 px-4 py-3 rounded-lg cursor-not-allowed transition"
          disabled
        >
          Wrong Network
        </button>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default LendModal;
