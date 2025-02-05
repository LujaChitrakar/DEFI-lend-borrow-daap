'use client'

import { useState, createContext } from "react"

export const DefiContext = createContext();

export const DefiProvider =({children})=>{
const [currentAccount,setCurrentAccount] = useState("Unknown");
    return(
        <DefiContext.Provider value={{currentAccount}}>
            {children}
        </DefiContext.Provider>
    )
}

