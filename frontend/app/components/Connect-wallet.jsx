"use client"

import React, {  useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet2, ArrowRight, Activity, DollarSign, Boxes, Sparkles, Gem } from "lucide-react";




const ConnectWallet = () => {
  const router = useRouter();



  const [isConnecting, setIsConnecting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);



  const handleWalletConnect = async () => {
    setIsConnecting(true);
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to continue");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative flex min-h-screen">
        {/* Left Section */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <div className="mb-12">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Boxes className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Core Instance v3</h1>
                <p className="text-gray-400">Advanced Ethereum Market Interface</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="space-y-4">
              <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center">
                    <Activity className="w-5 h-5 mr-2" /> Net APY
                  </span>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-2xl font-bold text-white">0%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" /> Net Worth
                  </span>
                  <div className="flex items-center space-x-2">
                    <Gem className="w-4 h-4 text-purple-400" />
                    <span className="text-2xl font-bold text-white">$0.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-1/2 p-12 flex items-center justify-center">
          <div className="max-w-md w-full">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse opacity-75" style={{ animationDuration: '3s' }} />
              <div className="relative w-32 h-32 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
                <Wallet2 className="w-16 h-16 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full animate-bounce" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400">
                Connect your wallet to access your supplies, borrowings, and manage your open positions.
              </p>
            </div>

            <button
              onClick={handleWalletConnect}
              disabled={isConnecting}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-full relative group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center space-x-2">
                <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
                <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;