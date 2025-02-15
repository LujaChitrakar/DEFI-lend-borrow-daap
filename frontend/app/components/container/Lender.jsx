"use client";
import React from "react";
import Container from "./Container";

const Lender = () => {
  const data = [
    { name: "Charlie", rate: "7%" },
    { name: "David", rate: "8%" },
  ];

  const handleLendClick = (item) => {
    console.log(`Lend button clicked for:`, item);
    alert(`You are lending to ${item.name} at ${item.rate}`);
  };

  return (
    <Container 
      name="Lenders" 
      data={data} 
      label="Lend" 
      onActionClick={handleLendClick} 
    />
  );
};

export default Lender;
