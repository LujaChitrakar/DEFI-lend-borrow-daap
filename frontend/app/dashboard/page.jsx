// "use client";
// import React, { useContext, useEffect, useState } from "react";

// import { defiContractAddress } from "../../contracts/contractABI.js";
// import abi from "../../contracts/ABI.json";
// import { ethers } from "ethers";

// function App() {
//   const [provider, setProvider] = useState();
//   const [signer, setSigner] = useState();
//   const [contract, setContract] = useState();
//   const [account, setAccount] = useState("");
//   const [stats, setStats] = useState({});

//   const contractABI = abi.abi;
//   const contractAddress = defiContractAddress.DeFiLending;

//   useEffect(() => {
//     const load = async () => {
//       try {
//         if (window.ethereum) {
//           const provider = new ethers.BrowserProvider(window.ethereum);
//           window.defiProvider = provider;

//           await window.ethereum.request({ method: "eth_requestAccounts" });
//           const signer = await provider.getSigner();
//           const account = await signer.getAddress();

//           const contract = new ethers.Contract(
//             contractAddress,
//             contractABI,
//             signer
//           );
//           console.log("Connected to contract:", contract);

//           // Make available in browser console
//           window.defiContract = contract;

//           setProvider(provider);
//           setSigner(signer);
//           setContract(contract);
//           setAccount(account);
//           fetchStats(contract);
//         } else {
//           alert("Please install MetaMask!");
//         }
//       } catch (err) {
//         console.error("Error during load:", err);
//       }
//     };

//     load();
//   }, []);

//   const fetchStats = async (contract) => {
//     const stats = {
//       userLend: ethers.formatEther(await contract.getLendAmount()),
//       userBorrow: ethers.formatEther(await contract.getBorrowAmount()),
//       userCollateral: ethers.formatEther(await contract.getUserCollateral()),
//       contractBalance: ethers.formatEther(await contract.getContractBalance()),
//       totalLent: ethers.formatEther(await contract.getTotalLent()),
//       totalBorrowed: ethers.formatEther(await contract.getTotalBorrowed()),
//     };
//     setStats(stats);
//   };

//   const sendETH = async (func, ethAmount) => {
//     const tx = await contract[func]({ value: ethers.parseEther(ethAmount) });
//     await tx.wait();
//     fetchStats(contract);
//   };

//   const callFunction = async (func, amount = null) => {
//     const tx = amount
//       ? await contract[func](ethers.parseEther(amount))
//       : await contract[func]();
//     await tx.wait();
//     fetchStats(contract);
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>🪙 DeFi Lending DApp</h2>
//       <p>
//         <b>Connected Wallet:</b> {account}
//       </p>
//       <hr />
//       <div>
//         <h4>Lend ETH</h4>
//         <button onClick={() => sendETH("lend", "0.01")}>Lend 0.01 ETH</button>
//       </div>
//       <div>
//         <h4>Withdraw</h4>
//         <button onClick={() => callFunction("withdraw", "0.01")}>
//           Withdraw 0.01 ETH
//         </button>
//       </div>
//       <div>
//         <h4>Deposit Collateral</h4>
//         <button onClick={() => sendETH("depositCollateral", "0.01")}>
//           Deposit 0.01 ETH
//         </button>
//       </div>
//       <div>
//         <h4>Borrow</h4>
//         <button onClick={() => callFunction("borrow", "0.005")}>
//           Borrow 0.005 ETH
//         </button>
//       </div>
//       <div>
//         <h4>Repay</h4>
//         <button onClick={() => sendETH("repay", "0.005")}>
//           Repay 0.005 ETH
//         </button>
//       </div>
//       <hr />
//       <h3>📊 Stats</h3>
//       <ul>
//         <li>
//           <b>Your Lent:</b> {stats.userLend} ETH
//         </li>
//         <li>
//           <b>Your Borrowed:</b> {stats.userBorrow} ETH
//         </li>
//         <li>
//           <b>Your Collateral:</b> {stats.userCollateral} ETH
//         </li>
//         <li>
//           <b>Contract Balance:</b> {stats.contractBalance} ETH
//         </li>
//         <li>
//           <b>Total Lent:</b> {stats.totalLent} ETH
//         </li>
//         <li>
//           <b>Total Borrowed:</b> {stats.totalBorrowed} ETH
//         </li>
//       </ul>
//     </div>
//   );
// }

// export default App;

// UI
"use client";
import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { defiContractAddress } from "../../contracts/contractABI.js";
import abi from "../../contracts/ABI.json";

function App() {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [contract, setContract] = useState();
  const [account, setAccount] = useState("");
  const [stats, setStats] = useState({});

  const contractABI = abi.abi;
  const contractAddress = defiContractAddress.DeFiLending;

  // Input states
  const [lendAmount, setLendAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          window.defiProvider = provider;

          await window.ethereum.request({ method: "eth_requestAccounts" });
          const signer = await provider.getSigner();
          const account = await signer.getAddress();

          const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          console.log("Connected to contract:", contract);

          // Make available in browser console
          window.defiContract = contract;

          setProvider(provider);
          setSigner(signer);
          setContract(contract);
          setAccount(account);
          fetchStats(contract);
        } else {
          alert("Please install MetaMask!");
        }
      } catch (err) {
        console.error("Error during load:", err);
      }
    };

    load();
  }, []);

  const fetchStats = async (contract) => {
    const stats = {
      userLend: ethers.formatEther(await contract.getLendAmount()),
      userBorrow: ethers.formatEther(await contract.getBorrowAmount()),
      userCollateral: ethers.formatEther(await contract.getUserCollateral()),
      contractBalance: ethers.formatEther(await contract.getContractBalance()),
      totalLent: ethers.formatEther(await contract.getTotalLent()),
      totalBorrowed: ethers.formatEther(await contract.getTotalBorrowed()),
    };
    setStats(stats);
  };

  const sendETH = async (func, ethAmount) => {
    const tx = await contract[func]({ value: ethers.parseEther(ethAmount) });
    await tx.wait();
    fetchStats(contract);
  };

  const callFunction = async (func, amount = null) => {
    const tx = amount
      ? await contract[func](ethers.parseEther(amount))
      : await contract[func]();
    await tx.wait();
    fetchStats(contract);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  DeFi Lending Protocol
                </h1>
                <p className="text-gray-400 text-sm">
                  Decentralized lending and borrowing
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-gray-700/50 rounded-lg px-4 py-2">
              <Wallet className="w-4 h-4 text-green-400" />
              <span className="text-sm font-mono">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Top Statistics Container */}
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span>Protocol Overview</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">
                    Total Lent
                  </p>
                  <p className="text-3xl font-bold text-blue-400">
                    {stats.totalLent} ETH
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">
                    Total Borrowed
                  </p>
                  <p className="text-3xl font-bold text-purple-400">
                    {stats.totalBorrowed} ETH
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <ArrowDownLeft className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Lending */}
          <div className="space-y-6">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-green-400">
                <TrendingUp className="w-5 h-5" />
                <span>Your Lending Position</span>
              </h3>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-green-300 text-sm">Amount Lent</p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.userLend} ETH
                </p>
              </div>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-400">
                Lend / Withdraw
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (ETH)
                  </label>
                  <input
                    type="number"
                    value={lendAmount}
                    onChange={(e) => setLendAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => sendETH("lend", lendAmount)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Lend ETH
                  </button>
                  <button
                    onClick={() => callFunction("withdraw", lendAmount)}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Borrowing */}
          <div className="space-y-6">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-purple-400">
                <TrendingDown className="w-5 h-5" />
                <span>Your Borrowing Position</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <p className="text-purple-300 text-sm">Borrowed</p>
                  <p className="text-xl font-bold text-purple-400">
                    {stats.userBorrow} ETH
                  </p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                  <p className="text-orange-300 text-sm">Collateral</p>
                  <p className="text-xl font-bold text-orange-400">
                    {stats.userCollateral} ETH
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-orange-400">
                <Shield className="w-5 h-5" />
                <span>Deposit Collateral</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Collateral Amount (ETH)
                  </label>
                  <input
                    type="number"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => sendETH("depositCollateral", collateralAmount)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Deposit Collateral
                </button>
              </div>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4 text-purple-400">
                Borrow / Repay
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (ETH)
                  </label>
                  <input
                    type="number"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => callFunction("borrow", borrowAmount)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Borrow ETH
                  </button>
                  <button
                    onClick={() => sendETH("repay", borrowAmount)}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    Repay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Balance */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-cyan-300 text-sm">Contract Balance</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {stats.contractBalance} ETH
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
