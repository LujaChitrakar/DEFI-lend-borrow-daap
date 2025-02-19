'use client'

import { useState, createContext } from "react"

export const DefiContext = createContext();

export const DefiProvider =({children})=>{
  const [accounts,setAccounts] = useState(null);
  const [userAddress,setUserAddress] = useState("");
  const [currentState,setCurrentState] = useState("");

  //Dashboard
  const [totalLendingTokens,setTotalLendingTokens] = useState([{ message: "No lending tokens yet." }]);
  const [totalCollateral,setTotalCollateral] = useState([{asset: "USDC", logo: "/usdc.png", available: 1000}]);
  
  const [totalLend,setTotalLend] = useState([{ message: "Nothing lent yet." }]);
    const [totalBorrow,setTotalBorrow] = useState([{ asset: "USDC", logo: "/usdc.png", available: 1000, apy: "2.5%", action: "Lend" }]);
  
const [tokensToBorrow,setTokensToBorrow] = useState([ { asset: "USDC", logo: "/usdc.png", available: 1000, apy: "2.5%", action: "Lend" }]);
const [tokensToLend,setTokensToLend] = useState([ {asset: "USDC", logo: "/usdc.png", available: 1000, apy: "2.5%", action: "Lend" }]);
  
const [openModalScreen, setOpenModalScreen] = useState(null);

    return(
        <DefiContext.Provider value={{accounts,setAccounts,userAddress,setUserAddress,currentState,setCurrentState,openModalScreen,setOpenModalScreen,totalLendingTokens,totalCollateral,totalLend,totalBorrow,tokensToLend,tokensToBorrow}}>
            {children}
        </DefiContext.Provider>
    )
}

