
"use client";

import React, { useContext, useState } from "react";
import { createPortal } from "react-dom";
import { DefiContext } from "../../context/DefiContext";
import { X } from "lucide-react";

const LendModal = () => {
  const { openModalScreen, setOpenModalScreen, currentState,setTotalLend,setTotalLendingTokens,
    setTokensToLend } = useContext(DefiContext);

  const [lendValue, setLendValue] = useState(0);

  const handleLend = async () => {

    try {
      setOpenModalScreen("LoadingScreen");
  
      const res = await currentState.contract?.depositStablecoin(lendValue);
      
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

  if ( openModalScreen !== "Lend") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-[400px] border border-gray-700">
        
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-[400px] border border-gray-700">
 
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-white">Lend Asset</h2>
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
              placeholder="0.00"
              className="bg-transparent flex-grow outline-none text-white placeholder-gray-500"
              onChange={(e)=>{setLendValue(parseInt(e.target.value))}}
          />
            <span className="text-gray-400">USDC</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Available to Lend: 1500 USDC</span>
            <button className="text-blue-400 hover:text-blue-500 transition">
              MAX
            </button>
          </div>
        </div>

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
        <button
          className="w-full bg-gray-700 text-gray-500 px-4 py-3 rounded-lg transition"
          onClick={handleLend}
        >
          Lend
        </button>
      </div>
    </div>
    </div>
    </div>
    ,
    document.getElementById("modal-root")
  )
};

export default LendModal;
