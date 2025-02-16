'use client'

import { useState, createContext } from "react"

export const DefiContext = createContext();

export const DefiProvider =({children})=>{
const [currentAccount,setCurrentAccount] = useState("Unknown");
const [openModalScreen, setOpenModalScreen] = useState(null);
    return(
        <DefiContext.Provider value={{currentAccount,openModalScreen,setOpenModalScreen}}>
            {children}
        </DefiContext.Provider>
    )
}

