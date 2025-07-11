"use client";

export default function StaffOverview({ currentStaff, isClient }) {
  const [staff1, staff2] = currentStaff;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md lg:col-span-2 flex flex-col">
      <h3 className="font-semibold text-lg text-gray-800 mb-4">Today's Staff</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        {isClient ? (
          <>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col justify-center items-center">
              {staff1 ? (
                <>
                  <p className="font-semibold text-gray-800">{staff1.name}</p>
                  <p className="text-sm text-gray-500">{staff1.department}</p>
                </>
              ) : (
                <p className="text-gray-500">No staff on duty</p>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col justify-center items-center">
              {staff2 ? (
                <>
                  <p className="font-semibold text-gray-800">{staff2.name}</p>
                  <p className="text-sm text-gray-500">{staff2.department}</p>
                </>
              ) : (
                <p className="text-gray-500">-</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col justify-center items-center">
              <p className="text-gray-500">Loading...</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col justify-center items-center">
              <p className="text-gray-500">-</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 