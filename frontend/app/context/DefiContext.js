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
    { message: "No lending tokens yet." },
  ]);
  const [totalCollateral, setTotalCollateral] = useState([
    { asset: "USDC", logo: "/usdc.png", available: 1000 },
  ]);
  const [totalLend, setTotalLend] = useState([
    { message: "Nothing lent yet." },
  ]);
  const [totalBorrow, setTotalBorrow] = useState([
    { asset: "USDC", logo: "/usdc.png", available: 1000, apy: "2.5%", action: "Lend" },
  ]);
  const [tokensToBorrow, setTokensToBorrow] = useState([
    { asset: "USDC", logo: "/usdc.png", available: 1000, apy: "2.5%", action: "Lend" },
  ]);
  const [tokensToLend, setTokensToLend] = useState([
    { asset: "USDC", logo: "/usdc.png", available: 1000, apy: "2.5%", action: "Lend" },
  ]);
  const [openModalScreen, setOpenModalScreen] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setUserAddress(accounts[0]);
        await setupContract(accounts[0]);
      } catch (error) {
        console.log("Wallet connection failed:", error);
      }
    }
  };

  const setupContract = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const signer = await provider.getSigner();
      
      // Verify contract code exists
      const code = await provider.getCode(contractAddress.DSCEngine);
      if (code === "0x") {
        throw new Error("Contract not found on network");
      }

      const dscEngine = new ethers.Contract(
        contractAddress.DSCEngine,
        DSCEngineArtifact.abi,
        signer
      );
      
      setContract(dscEngine);
      await updateUserData(dscEngine, address);
    } catch (error) {
      console.log("Contract setup failed:", error);
      setContract(null);
    }
  };

  const updateUserData = async (contract, address) => {
    try {
      if (!contract || !address) return;

      const defaultValue = ethers.parseEther("0");
      
      const [lendBalance, earnedInterest, healthFactor] = await Promise.all([
        contract.getYourLendedStablecoin().catch(() => defaultValue),
        contract.getYourEarnedLendingInterest().catch(() => defaultValue),
        contract.getYourHealthFactor().catch(() => defaultValue)
      ]);

      setTotalLend([{
        amount: ethers.formatEther(lendBalance),
        earnedInterest: ethers.formatEther(earnedInterest),
        healthFactor: ethers.formatEther(healthFactor)
      }]);
    } catch (error) {
      console.log("Data update failed:", error);
      setTotalLend([{ message: "Nothing lent yet." }]);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      connectWallet();
      window.ethereum.on('accountsChanged', (accounts) => {
        setUserAddress(accounts[0]);
        setupContract(accounts[0]);
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

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
        totalCollateral,
        setTotalCollateral,
        totalLend,
        totalBorrow,
        tokensToLend,
        tokensToBorrow,
        contract,
        updateUserData,
        connectWallet
      }}
    >
      {children}
    </DefiContext.Provider>
  );
};
