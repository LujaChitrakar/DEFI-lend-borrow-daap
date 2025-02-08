import React from 'react'
import './styles.css'
const Container = ({name,data}) => {
  return (
    <div className="gradient-box  w-[800px] h-[450px] bg-gray-400 rounded-lg   text-xl font-sans text-gray-700">
    <div className="overflow-y-auto h-full w-full p-2">
   <div className='sticky top-[-8px] bg-gray-400 p-2'>
    {name}
    </div>

        <table className="bg-gray-800 text-white w-full">
          <thead className="bg-gray-700 sticky top-[30px]">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Rate
              </th>
            </tr>
          </thead>
        
          <tbody className="divide-y divide-gray-700">
            {data.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-gray-750 transition duration-200"
              >
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>

    </div>
  )
}

export default Container