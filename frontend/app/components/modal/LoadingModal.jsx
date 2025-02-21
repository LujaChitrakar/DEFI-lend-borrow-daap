"use client";

import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DefiContext } from "../../context/DefiContext";
import { X } from "lucide-react";

const LoadingModal = () => {
  const { openModalScreen, setOpenModalScreen,currentState } = useContext(DefiContext);




  if (  openModalScreen !== "LoadingScreen") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-[300px] text-center">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <div className="w-8 h-8 border-4 border-t-4 border-white border-dotted rounded-full animate-spin"></div>
        </div>
        <p className="text-white text-lg font-semibold">Loading...</p>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default LoadingModal;
