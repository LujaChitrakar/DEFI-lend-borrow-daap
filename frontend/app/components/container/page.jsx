"use client";
import React from "react";
import "./styles.css";

const Container = (props) => {
  const handleClick = (item) => {
    if (props.onActionClick) {
      props.onActionClick(item);
    } else {
      console.warn("onActionClick is not defined");
    }
  };

  return (
    <div className="gradient-box w-[800px] h-[450px] bg-gray-400 font-sans text-gray-700">
      <div className="overflow-y-auto h-full w-full py-1 scrollbar-hide">
        <div className="sticky top-[-8px] bg-blue-300 p-2">
          <h2 className="flex flex-row flex-nowrap items-center">
            <span className="flex-grow block border-t border-black"></span>
            <span className="flex-none block mx-4 px-4 py-2.5 leading-none text-xl font-medium uppercase bg-black text-white">
              {props.name}
            </span>
            <span className="flex-grow block border-t border-black"></span>
          </h2>
        </div>

        <table className="bg-gray-800 text-white w-full">
          <thead className="bg-gray-700 sticky top-[50px]">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Rate
              </th>
              {props?.label && (
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {props.data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-750 transition duration-200">
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.rate}</td>
                {props?.label && (
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleClick(item)}
                      className="inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                    >
                      <span className="px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent hover:text-black">
                        {props?.label}
                      </span>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Container;
