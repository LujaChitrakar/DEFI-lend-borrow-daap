"use client";
import { useContext } from 'react';
import { DefiContext } from '../context/DefiContext';

const TotalLendContainer = () => {
  const { totalLend, setOpenModalScreen } = useContext(DefiContext);

  return (
      <div className="bg-gray-900 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Your Lending Position</h2>
              <div className="text-right">
                  <div className="text-white text-2xl">
                      {totalLend[0]?.amount || "0"} ETH
                  </div>
                  <div className="text-sm text-gray-400">
                      Health Factor: {totalLend[0]?.healthFactor || "N/A"}
                  </div>
              </div>
          </div>
          
          <div className="flex gap-4 mt-4">
              <button
                  onClick={() => setOpenModalScreen("Lend")}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                  Lend
              </button>
              <button
                  onClick={() => setOpenModalScreen("Withdraw")}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                  Withdraw
              </button>
          </div>
      </div>
  );
};


export default TotalLendContainer;
