'use client'

import { useState, createContext } from "react"

export const DefiContext = createContext();

export const DefiProvider =({children})=>{
const [currentAccount,setCurrentAccount] = useState("Unknown");
const [isOpenModalScreen, setOpenModalScreen] = useState(false);
    return(
        <DefiContext.Provider value={{currentAccount,isOpenModalScreen,setOpenModalScreen}}>
            {children}
        </DefiContext.Provider>
    )
}

