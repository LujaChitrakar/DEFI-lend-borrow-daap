"use client";
import React from "react";
import DashboardHeader from "./DashboardHeader";
import Container from "../components/container/page";
import LendModal from "../components/modal/LendModal";
import BorrowModal from "../components/modal/BorrowModal";

const Page = () => {
  // Sections that remain empty until backend integration
  const totalLendingTokens = [{ message: "No lending tokens yet." }];
  const totalCollateral = [{ message: "No collateral provided yet." }];
  const totalLends = [{ message: "Nothing lent yet." }];
  const totalBorrows = [{ message: "Nothing borrowed yet." }];
  const tokensToLend = [
    { asset: "USDC", logo: "/usdc.png", available: 1000, apy: "2.5%", action: "Lend" },
{ asset: "USDT", logo: "/usdt.png", available: 1500, apy: "3.1%", action: "Lend" },
  ];
  const tokensToBorrow = [
    { asset: "WETH", logo: "/WETH.webp", available: 5, apy: "2.0%", action: "Borrow" },
    { asset: "WBTC", logo: "/WBTC.png", available: 2, apy: "1.8%", action: "Borrow" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Modals */}
      <LendModal />
      <BorrowModal />
      <div id="modal-root"></div>

      {/* Dashboard Header */}
      <div className="bg-gray-800 p-6">
        <DashboardHeader />
      </div>

      {/* Main Dashboard Sections */}
      <div className="p-6 space-y-6">
        {/* Total Lending Tokens | Total Collateral */}
        <div className="grid grid-cols-2 gap-6">
          <Container name={"Total Lending Tokens"} data={totalLendingTokens} />
          <Container name={"Total Collateral"} data={totalCollateral} />
        </div>

        {/* Total Lends | Total Borrows */}
        <div className="grid grid-cols-2 gap-6">
          <Container name={"Total Lends"} data={totalLends} />
          <Container name={"Total Borrows"} data={totalBorrows} />
        </div>

        {/* Tokens to Lend | Tokens to Borrow */}
        <div className="grid grid-cols-2 gap-6">
          <Container name={"Tokens to Lend"} data={tokensToLend} label={"Lend"} />
          <Container name={"Tokens to Borrow"} data={tokensToBorrow} label={"Borrow"} />
        </div>
      </div>
    </div>
  );
};

export default Page;
