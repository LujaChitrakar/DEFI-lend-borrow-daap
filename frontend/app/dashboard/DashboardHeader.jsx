"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "antd";

const DashboardHeader = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <header className="w-full px-12 py-6 bg-gray-900 text-white flex justify-between items-center shadow-lg">
      {/* Left Section: Logo and Tabs */}
      <div className="flex items-center space-x-12">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="LendWise Logo" width={90} height={90} />
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
        <Button
          type="primary"
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-lg shadow-md hover:scale-105 transform transition-all"
        >
          Connect Wallet
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
