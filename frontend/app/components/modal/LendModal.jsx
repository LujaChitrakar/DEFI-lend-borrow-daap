"use client"
import React, { useContext } from 'react'
import ReactDOM from 'react-dom'
import { DefiContext } from '../../context/DefiContext'


const page = () => {

    const {openModalScreen,setOpenModalScreen} = useContext(DefiContext)

    
    return (openModalScreen==="Lend" &&  ReactDOM.createPortal(
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Lending Title</h2>
            <p className="mb-4">This is the lending content. Click the button below to close it.</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={()=>{setOpenModalScreen(null)}}>
              Close
            </button>
          </div>
        </div>,
        document.getElementById('modal-root')))
      
}

export default page