"use client";
import React from "react";
import Container from "./Container";

const Borrower = () => {
  const data = [
    { name: "Alice", rate: "5%" },
    { name: "Bob", rate: "6%" },
  ];

  const handleBorrowClick = (item) => {
    console.log(`Borrow button clicked for:`, item);
    alert(`You are borrowing from ${item.name} at ${item.rate}`);
  };

  return (
    <Container 
      name="Borrowers" 
      data={data} 
      label="Borrow" 
      onActionClick={handleBorrowClick} 
    />
  );
};

export default Borrower;
