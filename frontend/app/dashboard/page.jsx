"use client";
import React, { useEffect, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import Container from "../components/container/page";
import { Bitcoin, Wallet } from "lucide-react";

const FloatingCrypto = () => {
  const symbols = [
    { symbol: "₿", color: "text-orange-500", size: "text-2xl" },
    { symbol: "ETH", color: "text-blue-400", size: "text-xl" },
    { symbol: "USDT", color: "text-green-400", size: "text-lg" },
    { symbol: "USDC", color: "text-blue-500", size: "text-xl" },
    { symbol: "BNB", color: "text-yellow-400", size: "text-xl" },
    { symbol: "SOL", color: "text-purple-400", size: "text-lg" },
    { symbol: "DOT", color: "text-pink-400", size: "text-xl" },
    { symbol: "AVAX", color: "text-red-400", size: "text-lg" },
  ];

  const [cryptoPositions, setCryptoPositions] = useState([]);

  useEffect(() => {
    const positions = symbols.map((_, index) => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${index * 0.5}s`,
      animationDuration: `${10 + Math.random() * 5}s`,
    }));
    setCryptoPositions(positions);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {symbols.map((item, index) => (
        <div
          key={index}
          className={`absolute animate-float ${item.color} ${item.size} font-bold`}
          style={{
            left: cryptoPositions[index]?.left,
            animationDelay: cryptoPositions[index]?.animationDelay,
            animationDuration: cryptoPositions[index]?.animationDuration,
            opacity: 0.2,
          }}
        >
          {item.symbol}
        </div>
      ))}
    </div>
  );
};

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse" 
           style={{ animationDuration: '7s' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse"
           style={{ animationDuration: '8s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl animate-pulse"
           style={{ animationDuration: '6s' }} />
    </div>
  </div>
);

const Page = () => {
  const data1 = [
    { id: 1, name: "Mike", rate: 32 },
    { id: 2, name: "John", rate: 42 },
    { id: 3, name: "Alice", rate: 28 },
    { id: 4, name: "David", rate: 35 },
    { id: 5, name: "Sophia", rate: 30 },
    { id: 6, name: "Chris", rate: 40 },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <FloatingCrypto />
      
      <div className="relative z-10">
        <div className="bg-gray-800/80 backdrop-blur-sm text-white">
          <DashboardHeader />
          <div className="flex justify-center items-center py-8">
            <div className="relative">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Welcome to the Dashboard!
              </h1>
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-20" />
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4">
          <div className="flex justify-between mb-4">
            <Container name={"Your Borrows"} data={data1} />
            <Container name={"Your Lends"} data={data1} />
          </div>
          <div className="flex justify-between mt-4">
            <Container name={"Assets To Borrow"} data={data1} label={"Borrow"} />
            <Container name={"Assets To Lend"} data={data1} label={"Lend"} />
          </div>
        </div>
      </div>

      {/* Decorative Bottom Element */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
    </div>
  );
};

// Add required styles to your global CSS
const styles = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-100px) rotate(10deg);
    }
  }
  
  .animate-float {
    animation: float linear infinite;
    position: absolute;
  }
`;

export default Page;
