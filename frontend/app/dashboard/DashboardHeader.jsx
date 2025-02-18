"use client";

import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { DefiContext } from "../context/DefiContext";
// import { Button } from "antd";

const DashboardHeader = () => {

  const {userAddress} = useContext(DefiContext)

  const [activeTab, setActiveTab] = useState("Dashboard");

  console.log(userAddress)
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <header className="w-full px-12 py-6 bg-gray-900 text-white flex justify-between items-center hover:opacity-90 transition-all transform  shadow-lg ">
      {/* Left Section: Logo and Tabs */}
      <div className="flex items-center space-x-12  hover:scale-105">
        {/* Logo */} 
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="LendWise Logo" width={110} height={100} />
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-8">
          {["Dashboard"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`relative text-lg font-medium transition-colors ${
                activeTab === tab ? "text-blue-500" : "text-gray-400"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute left-0 bottom-0 h-1.5 w-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Right Section: Buttons */}
      <div className="flex items-center space-x-4">
     { userAddress?.length<1 ?(<button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-lg shadow-md hover:scale-105 transform transition-all">
  Connect Wallet
</button>):
     ( <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-lg shadow-md hover:scale-105 transform transition-all">
  {userAddress}
</div>)}
      </div>
    </header>
  );
};

export default DashboardHeader;
