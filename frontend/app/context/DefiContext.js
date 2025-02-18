'use client'

import { useState, createContext } from "react"

export const DefiContext = createContext();

export const DefiProvider =({children})=>{
  const [accounts,setAccounts] = useState(null);
  const [userAddress,setUserAddress] = useState("");
  const [currentState,setCurrentState] = useState("");

const [openModalScreen, setOpenModalScreen] = useState(null);
    return(
        <DefiContext.Provider value={{accounts,setAccounts,userAddress,setUserAddress,currentState,setCurrentState,openModalScreen,setOpenModalScreen}}>
            {children}
        </DefiContext.Provider>
    )
}

