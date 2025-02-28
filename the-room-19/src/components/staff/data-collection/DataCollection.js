"use client"
import { useState } from 'react';
import { Manrope } from 'next/font/google';
import { FaSearch, FaPlus } from 'react-icons/fa';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export default function DataCollection() {
  const [activeTab, setActiveTab] = useState('session');

  // Dummy data untuk contoh
  const sessionData = [
    { id: 1, name: "John Doe", date: "2024-03-20", shift: "Morning", category: "Individual", status: "Approved" },
    { id: 2, name: "Jane Smith", date: "2024-03-21", shift: "Afternoon", category: "Group", status: "Pending" },
    { id: 3, name: "Mike Johnson", date: "2024-03-22", shift: "Evening", category: "Individual", status: "Approved" },
    { id: 4, name: "Sarah Williams", date: "2024-03-23", shift: "Morning", category: "Group", status: "Cancelled" },
    { id: 5, name: "David Brown", date: "2024-03-24", shift: "Afternoon", category: "Individual", status: "Pending" }
  ];

  const eventData = [
    { id: 1, name: "John Doe", date: "2024-03-25", shift: "Morning", event: "Puppet Workshop", status: "Approved" },
    { id: 2, name: "Jane Smith", date: "2024-03-26", shift: "Afternoon", event: "Board Game Night", status: "Pending" },
    { id: 3, name: "Mike Johnson", date: "2024-03-27", shift: "Evening", event: "Art Exhibition", status: "Approved" },
    { id: 4, name: "Sarah Williams", date: "2024-03-28", shift: "Morning", event: "Book Club", status: "Cancelled" },
    { id: 5, name: "David Brown", date: "2024-03-29", shift: "Afternoon", event: "Movie Screening", status: "Pending" }
  ];

  const membershipData = [
    { id: 1, name: "John Doe", type: "Student", startDate: "2024-03-01", endDate: "2024-09-01", status: "Active" },
    { id: 2, name: "Jane Smith", type: "Regular", startDate: "2024-03-15", endDate: "2024-09-15", status: "Active" },
    { id: 3, name: "Mike Johnson", type: "Premium", startDate: "2024-03-10", endDate: "2024-09-10", status: "Inactive" },
    { id: 4, name: "Sarah Williams", type: "Student", startDate: "2024-03-05", endDate: "2024-09-05", status: "Active" },
    { id: 5, name: "David Brown", type: "Regular", startDate: "2024-03-20", endDate: "2024-09-20", status: "Pending" }
  ];

  // Tambahkan state untuk mengelola status
  const [statuses, setStatuses] = useState(
    sessionData.map(item => ({
      id: item.id,
      status: 'not attend'
    }))
  );

  const handleStatusChange = (id, newStatus) => {
    setStatuses(prevStatuses => 
      prevStatuses.map(status => 
        status.id === id ? { ...status, status: newStatus } : status
      )
    );
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative mb-4">
        <div className="bg-gradient-to-l from-[#4d4d4d] to-black w-full h-[200px] flex items-center">
          <div className="max-w-[1440px] w-full mx-auto px-4 lg:px-8">
            <h1 className={`text-[#fcfcfc] text-5xl font-medium leading-[48px] ${manrope.className}`}>
              DATA <br/>COLLECTION
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-[1440px] w-full mx-auto px-8 lg:px-12 pb-16">
        {/* Tab Navigation */}
        <div className="flex border-b border-[#666666]/10 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('session')}
            className={`px-6 py-3 text-sm transition-all relative ${
              activeTab === 'session'
                ? 'text-[#111010] font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#111010]'
                : 'text-[#666666]'
            }`}
          >
            Session Reservation
          </button>
          <button
            onClick={() => setActiveTab('event')}
            className={`px-6 py-3 text-sm transition-all relative ${
              activeTab === 'event'
                ? 'text-[#111010] font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#111010]'
                : 'text-[#666666]'
            }`}
          >
            Event Reservation
          </button>
          <button
            onClick={() => setActiveTab('membership')}
            className={`px-6 py-3 text-sm transition-all relative ${
              activeTab === 'membership'
                ? 'text-[#111010] font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#111010]'
                : 'text-[#666666]'
            }`}
          >
            Membership
          </button>
        </div>

        {/* Tables Section */}
        <div className="w-full overflow-x-auto">
          {activeTab === 'session' && (
            <>
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="relative w-full md:w-[300px]">
                  <input
                    type="text"
                    placeholder="Search"
                    className="h-[35px] w-full rounded-2xl border border-[#666666]/30 pl-10 pr-4 text-sm font-normal font-['Poppins'] text-[#666666]"
                  />
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" size={14} />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#111010] text-white rounded-xl text-sm font-['Poppins']">
                  <FaPlus size={12} />
                  Create
                </button>
              </div>
              <div className="min-w-[768px] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="first:rounded-tl-xl text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap bg-[#eaeaea]">No</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap bg-[#eaeaea]">Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap bg-[#eaeaea]">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap bg-[#eaeaea]">Shift</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap bg-[#eaeaea]">Category</th>
                      <th className="rounded-tr-xl text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap bg-[#eaeaea]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionData.map((item) => (
                      <tr key={item.id} className="border-b border-[#666666]/10">
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.id}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.name}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.date}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.shift}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.category}</td>
                        <td className="py-3 px-4 text-xs font-['Poppins']">
                          <select
                            value={statuses.find(status => status.id === item.id)?.status || 'not attend'}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-xs ${
                              statuses.find(status => status.id === item.id)?.status === 'attend'
                                ? 'text-green-700 bg-green-50' 
                                : 'text-red-700 bg-red-50'
                            }`}
                          >
                            <option value="not attend" className="text-red-700 bg-white">Not Attend</option>
                            <option value="attend" className="text-green-700 bg-white">Attend</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          
          {activeTab === 'event' && (
            <>
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="relative w-full md:w-[300px]">
                  <input
                    type="text"
                    placeholder="Search"
                    className="h-[35px] w-full rounded-2xl border border-[#666666]/30 pl-10 pr-4 text-sm font-normal font-['Poppins'] text-[#666666]"
                  />
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" size={14} />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#111010] text-white rounded-xl text-sm font-['Poppins']">
                  <FaPlus size={12} />
                  Create
                </button>
              </div>
              <div className="min-w-[768px] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#eaeaea]">
                      <th className="first:rounded-tl-xl last:rounded-tr-xl text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">No</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Shift</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Event</th>
                      <th className="first:rounded-tl-xl last:rounded-tr-xl text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventData.map((item) => (
                      <tr key={item.id} className="border-b border-[#666666]/10">
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.id}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.name}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.event}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.date}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.shift}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          
          {activeTab === 'membership' && (
            <>
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="relative w-full md:w-[300px]">
                  <input
                    type="text"
                    placeholder="Search"
                    className="h-[35px] w-full rounded-2xl border border-[#666666]/30 pl-10 pr-4 text-sm font-normal font-['Poppins'] text-[#666666]"
                  />
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" size={14} />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#111010] text-white rounded-xl text-sm font-['Poppins']">
                  <FaPlus size={12} />
                  Create
                </button>
              </div>
              <div className="min-w-[768px] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#eaeaea]">
                      <th className="first:rounded-tl-xl last:rounded-tr-xl text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">No</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Date Join</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Email</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Phone</th>
                      <th className="first:rounded-tl-xl last:rounded-tr-xl text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membershipData.map((item) => (
                      <tr key={item.id} className="border-b border-[#666666]/10">
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.id}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.name}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.type}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.startDate}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.endDate}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}