"use client"

import { useContext } from "react";
import { DefiContext } from "./context/DefiContext";

export default function Home() {

  const {currentAccount} = useContext(DefiContext);

  return (
   <>
   This is the home page! <hr/>
   Current Account : {currentAccount}
   </>
  );
}
