import React from 'react';
import DashboardHeader from './DashboardHeader';

const Page = () => {
  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <DashboardHeader />
      <div className="flex justify-center items-center">
        <h1 className="text-4xl font-bold">Welcome to the Dashboard!</h1>
      </div>
    </div>
  );
};

export default Page;
