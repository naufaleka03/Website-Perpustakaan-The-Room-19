"use client";

export default function BorrowingActivity({ borrowedCount = 38, lateCount = 0 }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2 flex flex-col">
      <h3 className="font-semibold text-lg text-gray-800 mb-4">Borrowing Activity</h3>
      <div className="flex-grow flex justify-around items-center text-center">
        <div>
          <p className="text-6xl font-bold text-gray-800">{borrowedCount}</p>
          <p className="text-lg text-gray-500 mt-2">Borrowed</p>
        </div>
        <div>
          <p className="text-6xl font-bold text-gray-800">{lateCount}</p>
          <p className="text-lg text-gray-500 mt-2">Late</p>
        </div>
      </div>
    </div>
  );
} 