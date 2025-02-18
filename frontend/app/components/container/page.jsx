"use client";
import React, { useContext } from "react";
import { DefiContext } from "../../context/DefiContext";

const Container = ({ name, data = [], label,apy=null }) => {
  const { setOpenModalScreen } = useContext(DefiContext);

  return (
    <div className="bg-gray-800 p-5 rounded-lg shadow-md min-h-[200px]">
      {/* Section Title */}
      <h2 className="text-lg font-semibold text-white mb-4">{name}</h2>

      {/* Empty State Message */}
      {data.length === 0 || (data[0]?.message && data.length === 1) ? (
        <div className="text-gray-400 text-sm text-center py-6">{data[0]?.message || "Nothing available"}</div>
      ) : (
        <table className="w-full text-sm text-white">
          <thead className="border-b border-gray-700">
            <tr>
              <th className="py-2 text-left">Asset</th>
              <th className="py-2 text-left">Available</th>
              <th className="py-2 text-left">APY</th>
              {label && <th className="py-2 text-left">Action</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) =>
              item.message ? null : (
                <tr key={index} className="border-b border-gray-700">
                  <td className="py-2 flex items-center gap-2">
                    {item.logo && <img src={item.logo} alt={item.asset} className="w-6 h-6" />}
                    {item.asset}
                  </td>
                  <td className="py-2">{item.available || item.balance}</td>
                  <td className="py-2">{apy}</td>
                  {label && (
                    <td className="py-2">
                      <button
                        onClick={() => setOpenModalScreen(label)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                      >
                        {label}
                      </button>
                    </td>
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Container;
