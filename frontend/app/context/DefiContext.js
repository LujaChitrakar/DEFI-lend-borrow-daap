"use client";
import { useState, createContext, useEffect } from "react";
import { ethers } from "ethers";
import contractAddress from "../../contracts/contract-address.json";
import DSCEngineArtifact from "../../contracts/DSCEngine.json";

export const DefiContext = createContext();

export const DefiProvider = ({ children }) => {
  const [accounts, setAccounts] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [currentState, setCurrentState] = useState("");
  const [contract, setContract] = useState(null);

  const [totalLendingTokens, setTotalLendingTokens] = useState([
    { asset: "USDC", logo: "/usdc.png", available: 0 },
  ]);
  const [totalCollateral, setTotalCollateral] = useState([
    { asset: "USDC", logo: "/usdc.png", available: 0 },
  ]);
  const [totalLend, setTotalLend] = useState([
    { asset: "USDC", logo: "/usdc.png", apy:"5%", available: 0 },
  ]);
  const [totalBorrow, setTotalBorrow] = useState([
    { asset: "USDC", logo: "/usdc.png", available: 0, apy: "7%", action: "Borrow" },
  ]);
  const [tokensToBorrow, setTokensToBorrow] = useState([
    { asset: "USDC", logo: "/usdc.png", available: 0, apy: "7%", action: "Borrow" },
  ]);
  const [tokensToLend, setTokensToLend] = useState([
    { asset: "USDC", logo: "/usdc.png", available: 0, apy: "5%", action: "Lend" },
  ]);

  const [openModalScreen, setOpenModalScreen] = useState(null);


  return (
    <DefiContext.Provider
      value={{
        accounts,
        setAccounts,
        userAddress,
        setUserAddress,
        currentState,
        setCurrentState,
        openModalScreen,
        setOpenModalScreen,
        totalLendingTokens,
        setTotalLendingTokens,
        totalCollateral,
        setTotalCollateral,
        totalLend,
        setTotalLend,
        totalBorrow,
        tokensToLend,
        setTokensToLend,
        tokensToBorrow,
      }}
    >
      {children}
    </DefiContext.Provider>
  );
};
