
import React from 'react';
import DashboardHeader from './DashboardHeader';
import Container from "../components/container/page"
import LendModal from "../components/modal/LendModal"
import BorrowModal from "../components/modal/BorrowModal"

const page = () => {
  const data1 = [
    {
     
      name: 'Mike',
      rate: 32,
      
    },
    {
      key: '2',
      name: 'John',
      rate: 42,
      
    },
    {
     
      name: 'Mike',
      rate: 32,
      
    },
    {
      key: '2',
      name: 'John',
      rate: 42,
      
    },
    {
     
      name: 'Mike',
      rate: 32,
      
    },
    {
      key: '2',
      name: 'John',
      rate: 42,
      
    },
    {
     
      name: 'Mike',
      rate: 32,
      
    },
    {
      key: '2',
      name: 'John',
      rate: 42,
      
    },
    {
     
      name: 'Mike',
      rate: 32,
      
    },
    {
      key: '2',
      name: 'John',
      rate: 42,
      
    },
    {
     
      name: 'Mike',
      rate: 32,
      
    },
    {
      key: '2',
      name: 'John',
      rate: 42,
      
    },
    {
     
      name: 'Mike',
      rate: 32,
      
    },
    {
      key: '2',
      name: 'John',
      rate: 42,
      
    },
    {
     
      name: 'Mike',
      rate: 32,
      
    },
    {
      key: '2',
      name: 'John',
      rate: 42,
      
    },
  ];
  return (
    <div>
       <LendModal/>
       <BorrowModal/>
     <div id="modal-root">
      </div>
    <div className=" bg-gray-800 text-white">
    
        <DashboardHeader />
        <div className="flex justify-center items-center">
           <h1 className="text-4xl font-bold">Welcome to the Dashboard!</h1>
    </div>
    </div>
    <div className="flex flex-col p-4">
    <div className="flex justify-between mb-4">
    
        <Container name={"Your Borrows"} data={data1}/>
        <Container name={"Your Lends"} data={data1}/>
    </div>
    <div className="flex justify-between mt-4">
        
        <Container name={"Assets To Borrow"} data={data1} label={"Borrow"}/>
        <Container name={"Assets To Lend"} data={data1} label={"Lend"}/>
    </div>
    </div>
        </div>
  )
  
}


export default page;