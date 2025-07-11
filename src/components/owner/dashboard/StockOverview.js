"use client";

export default function StockOverview({ stockData }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md aspect-square flex flex-col">
      <h3 className="font-semibold text-lg text-gray-800 mb-4">Stock Overview</h3>
      <div className="overflow-y-auto flex-grow">
        <ul className="space-y-2">
          {stockData.map((item, index) => (
            <li key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{item.name}</span>
              <span className="font-semibold text-gray-800">{item.qty}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 