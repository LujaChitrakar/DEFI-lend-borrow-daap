"use client";
import React, { useContext, useEffect } from "react";
import DashboardHeader from "./DashboardHeader";
import Container from "../components/container/Container";
import LendModal from "../components/modal/LendModal";
import BorrowModal from "../components/modal/BorrowModal";

import DefiContract from "../../contracts/DSCEngine.json";
import DefiContractAddress from "../../contracts/contract-address.json";
import { DefiContext } from "../context/DefiContext";
import { ethers } from "ethers";
import RepayModal from "../components/modal/RepayModal";

const contractAbi = DefiContract.abi;
const contractAddress = DefiContractAddress.DSCEngine;
const Page = () => {
  const {
    setAccounts,
    userAddress,
    setUserAddress,
    currentState,
    setCurrentState,
    totalLendingTokens,
    totalCollateral,
    setTotalCollateral,
    totalLend,
    totalBorrow,
    tokensToBorrow,
    tokensToLend,
  } = useContext(DefiContext);

  useEffect(() => {
    const connectWallet = async () => {
      const { ethereum } = window;
      if (ethereum) {
        window.ethereum.on("chainChanged", () => window.location.reload());
        window.ethereum.on("accountsChanged", () => window.location.reload());
        const accountsReq = await ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.BrowserProvider(ethereum);

        const signer = await provider.getSigner();

        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        setAccounts(accountsReq);
        setUserAddress(accountsReq[0]);
        setCurrentState({ provider, signer, contract });
      }
    };
    connectWallet();
  }, []);

  useEffect(() => {
    const fetchCollateral = async () => {
      const value = await currentState.contract?.getYourCollateralDeposited();
      setTotalCollateral((prev) => {
        var temp = prev[0];
        return [{ ...temp, available: value }];
      });

      setTotalCollateral((prev) => {
        var temp = prev[0];
        return [{ ...temp, available: value }];
      });
    };
    fetchCollateral();
  }, [currentState]);

  // Sections that remain empty until backend integration

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Modals */}
      <LendModal />
      <BorrowModal />
      <RepayModal />
      <div id="modal-root"></div>

      {/* Dashboard Header */}
      <div className="bg-gray-800 p-6">
        <DashboardHeader />
      </div>

      {/* Main Dashboard Sections */}
      <div className="p-6 space-y-6">
        {/* Total Lending Tokens | Total Collateral */}
        <div className="grid grid-cols-2 gap-6">
          <Container name={"Total Stable Coins"} data={totalLend} />
          <Container name={"Total Collateral"} data={totalCollateral} />
        </div>

        {/* Total Lends | Total Borrows */}
        <div className="grid grid-cols-2 gap-6">
          <Container name={"Total Lends"} data={totalLend} />
          <Container
            name={"Total Borrows"}
            data={totalBorrow}
            label1={"Borrow"}
            label2={"Repay"}
            apy={"7%"}
          />
        </div>

        {/* Tokens to Lend | Tokens to Borrow */}
        <div className="grid grid-cols-2 gap-6">
          <Container
            name={"Tokens to Lend"}
            data={tokensToLend}
            label1={"Lend"}
            apy={"5%"}
          />
          <Container
            name={"Tokens to Borrow"}
            data={tokensToBorrow}
            label1={"Borrow"}
            apy={"7%"}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
