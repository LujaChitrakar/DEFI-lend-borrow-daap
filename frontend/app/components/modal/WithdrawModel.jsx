"use client";
import { useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DefiContext } from "../../context/DefiContext";
import { X } from "lucide-react";
import { ethers } from "ethers";

const WithdrawModal = () => {
    const { openModalScreen, setOpenModalScreen, contract, userAddress, updateUserData } = useContext(DefiContext);
    const [mounted, setMounted] = useState(false);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [withdrawableBalance, setWithdrawableBalance] = useState("0");

    useEffect(() => {
        setMounted(true);
        if (contract && userAddress) {
            fetchWithdrawableBalance();
        }
    }, [contract, userAddress]);

    const fetchWithdrawableBalance = async () => {
        try {
            const balance = await contract.getYourLendedStablecoin();
            setWithdrawableBalance(ethers.formatEther(balance));
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    };

    const handleWithdraw = async () => {
        if (!amount || !contract) return;
        setLoading(true);
        try {
            const tx = await contract.withdrawStablecoin(
                ethers.parseEther(amount.toString())
            );
            await tx.wait();
            
            await updateUserData(contract, userAddress);
            setAmount("");
            setOpenModalScreen(null);
        } catch (error) {
            console.error("Withdrawal failed:", error);
            alert("Withdrawal failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleMaxClick = () => {
        setAmount(withdrawableBalance);
    };

    if (!mounted || openModalScreen !== "Withdraw") return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-70">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-[500px] border border-gray-700">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-white">Withdraw USDC</h2>
                    <button onClick={() => setOpenModalScreen(null)} className="text-gray-400 hover:text-white transition">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Amount</label>
                    <div className="flex items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            max={withdrawableBalance}
                            className="bg-transparent flex-grow outline-none text-white placeholder-gray-500"
                        />
                        <span className="text-gray-400">USDC</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Available: {parseFloat(withdrawableBalance).toFixed(4)} USDC</span>
                        <button
                            onClick={handleMaxClick}
                            className="text-blue-400 hover:text-blue-500 transition"
                        >
                            MAX
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleWithdraw}
                    disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(withdrawableBalance)}
                    className={`w-full px-4 py-3 rounded-lg transition mt-4 ${
                        loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(withdrawableBalance)
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                >
                    {loading ? "Processing..." : "Withdraw"}
                </button>
            </div>
        </div>,
        document.getElementById("modal-root")
    );
};

export default WithdrawModal;
