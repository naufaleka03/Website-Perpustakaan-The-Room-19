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
    { id: 1, name: "John Doe", date: "2024-03-20", type: "Individual", status: "Approved" },
    { id: 2, name: "Jane Smith", date: "2024-03-21", type: "Group", status: "Pending" },
  ];

  const eventData = [
    { id: 1, name: "John Doe", event: "Puppet Workshop", date: "2024-03-25", type: "Individual", status: "Approved" },
    { id: 2, name: "Jane Smith", event: "Board Game Night", date: "2024-03-26", type: "Group", status: "Pending" },
  ];

  const membershipData = [
    { id: 1, name: "John Doe", type: "Student", startDate: "2024-03-01", endDate: "2024-09-01", status: "Active" },
    { id: 2, name: "Jane Smith", type: "Regular", startDate: "2024-03-15", endDate: "2024-09-15", status: "Active" },
  ];

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <div className="relative mb-4">
        <div className="bg-gradient-to-l from-[#4d4d4d] to-black w-full h-[200px] flex items-center">
          <div className="max-w-[1440px] w-full mx-auto px-8">
            <h1 className={`text-[#fcfcfc] text-5xl font-medium leading-[48px] ${manrope.className}`}>
              DATA <br/>COLLECTION
            </h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex border-b border-[#666666]/10 mb-6">
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

        {/* Tables */}
        <div className="max-w-[1440px] mx-auto px-8">
          {/* Session Reservation Table */}
          {activeTab === 'session' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-[300px]">
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
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="first:rounded-tl-xl last:rounded-tr-xl text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap bg-[#eaeaea]">No</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap bg-[#eaeaea]">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap bg-[#eaeaea]">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap bg-[#eaeaea]">Shift</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap bg-[#eaeaea]">Category</th>
                    <th className="first:rounded-tl-xl last:rounded-tr-xl text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap bg-[#eaeaea]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionData.map((item) => (
                    <tr key={item.id} className="border-b border-[#666666]/10">
                      <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.id}</td>
                      <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.name}</td>
                      <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.date}</td>
                      <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.type}</td>
                      <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Event Reservation Table */}
          {activeTab === 'event' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-[300px]">
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
                      <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.type}</td>
                      <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] whitespace-nowrap">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Membership Table */}
          {activeTab === 'membership' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-[300px]">
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
              <table className="w-full">
                <thead>
                  <tr className="bg-[#eaeaea]">
                    <th className="first:rounded-tl-xl last:rounded-tr-xl text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Start Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">End Date</th>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}