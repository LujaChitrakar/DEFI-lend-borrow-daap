"use client";
import ConnectWallet from "../components/Connect-wallet";
import { DefiProvider } from "../context/DefiContext";

const ConnectWalletPage = () => {
    return (
        <DefiProvider>
            <ConnectWallet />
        </DefiProvider>
    );
};

export default ConnectWalletPage;
