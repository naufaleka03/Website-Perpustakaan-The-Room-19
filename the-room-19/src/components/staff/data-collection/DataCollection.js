"use client"
import { useState, useEffect } from 'react';
import { Manrope } from 'next/font/google';
import { FaSearch, FaPlus, FaEllipsisV } from 'react-icons/fa';
import { membershipData } from './data/membershipData';
import { sessionData } from './data/sessionData';
import { eventData } from './data/eventData';
import CancelConfirmationModal from './CancelConfirmationModal';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export default function DataCollection() {
  const [activeTab, setActiveTab] = useState('session');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionCurrentPage, setSessionCurrentPage] = useState(1);
  const [eventCurrentPage, setEventCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // Fungsi pagination untuk setiap tabel
  const getTableData = (data, page) => {
    const startIndex = (page - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data) => Math.ceil(data.length / entriesPerPage);

  // Render pagination controls
  const PaginationControls = ({ currentPage, setCurrentPage, totalPages }) => (
    <div className="flex justify-between items-center mt-4 text-xs text-[#666666] font-['Poppins']">
      <div className="flex items-center gap-2">
        Show
        <select 
          value={entriesPerPage}
          onChange={(e) => {
            setEntriesPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border border-[#666666]/30 rounded px-2 py-1 text-xs"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        entries
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded text-xs ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400' 
              : 'bg-white text-[#666666] border border-[#666666]/30'
          }`}
        >
          Previous
        </button>
        <span className="px-2 py-1 bg-[#111010] text-white rounded text-xs">{currentPage}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 rounded text-xs ${
            currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400' 
              : 'bg-white text-[#666666] border border-[#666666]/30'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );

  // Update state untuk session
  const [statuses, setStatuses] = useState(
    sessionData.map(item => ({
      id: item.id,
      status: 'not attend',
      isCanceled: false
    }))
  );

  const handleStatusChange = (id, newStatus) => {
    setStatuses(prevStatuses => 
      prevStatuses.map(status => 
        status.id === id ? { ...status, status: newStatus } : status
      )
    );
  };

  // Update state untuk event
  const [eventStatuses, setEventStatuses] = useState(
    eventData.map(item => ({
      id: item.id,
      status: 'not attend',
      isCanceled: false
    }))
  );

  const handleEventStatusChange = (id, newStatus) => {
    setEventStatuses(prevStatuses => 
      prevStatuses.map(status => 
        status.id === id ? { ...status, status: newStatus } : status
      )
    );
  };

  // Tambahkan state untuk membership status
  const [membershipStatuses, setMembershipStatuses] = useState(
    membershipData.map(item => ({
      id: item.id,
      status: 'request'
    }))
  );

  const handleMembershipStatusChange = (id, newStatus) => {
    setMembershipStatuses(prevStatuses => 
      prevStatuses.map(status => 
        status.id === id ? { ...status, status: newStatus } : status
      )
    );
  };

  const handleCancelClick = (id) => {
    setSelectedBookingId(id);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleConfirmCancel = () => {
    if (activeTab === 'session') {
      setStatuses(prevStatuses =>
        prevStatuses.map(status =>
          status.id === selectedBookingId
            ? { ...status, status: 'canceled', isCanceled: true }
            : status
        )
      );
    } else if (activeTab === 'event') {
      setEventStatuses(prevStatuses =>
        prevStatuses.map(status =>
          status.id === selectedBookingId
            ? { ...status, status: 'canceled', isCanceled: true }
            : status
        )
      );
    }
    setIsModalOpen(false);
    setSelectedBookingId(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownButton = event.target.closest('button');
      const dropdownMenu = event.target.closest('.dropdown-menu');
      
      if (!dropdownButton?.classList.contains('dropdown-trigger') && !dropdownMenu) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                    className="h-[35px] w-full rounded-2xl border border-[#666666]/30 pl-10 pr-4 text-xs font-normal font-['Poppins'] text-[#666666]"
                  />
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" size={14} />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#111010] text-white rounded-xl text-xs font-['Poppins']">
                  <FaPlus size={12} />
                  Create
                </button>
              </div>
              <div className="min-w-[768px] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#eaeaea]">
                      <th className="first:rounded-tl-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">No</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Name</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Date</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Shift</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Category</th>
                      <th className="first:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Status</th>
                      <th className="first:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTableData(sessionData, sessionCurrentPage).map((item) => (
                      <tr 
                        key={item.id} 
                        className={`border-b border-[#666666]/10 hover:bg-gray-100 cursor-pointer transition-colors duration-200`}
                        onClick={() => setSelectedRow(item.id)}
                        onMouseLeave={() => setSelectedRow(null)}
                      >
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.id}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.name}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.date}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.shift}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.category}</td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] text-center">
                          {statuses.find(status => status.id === item.id)?.isCanceled ? (
                            <span className="px-2 py-1 rounded-lg text-xs text-red-800 bg-red-100">
                              Canceled
                            </span>
                          ) : (
                            <select
                              value={statuses.find(status => status.id === item.id)?.status || 'not attend'}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              className={`px-2 py-1 rounded-lg text-xs ${
                                statuses.find(status => status.id === item.id)?.status === 'attend'
                                  ? 'text-green-800 bg-green-100'
                                  : 'text-yellow-800 bg-yellow-100'
                              }`}
                            >
                              <option value="not attend" className="text-yellow-800 bg-white">Not Attend</option>
                              <option value="attend" className="text-green-800 bg-white">Attend</option>
                            </select>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] relative text-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === item.id ? null : item.id);
                            }}
                            className="text-[#666666] hover:text-[#111010] dropdown-trigger"
                          >
                            <FaEllipsisV size={14} />
                          </button>
                          
                          {activeDropdown === item.id && (
                            <div 
                              className="absolute right-0 w-36 bg-white rounded-lg shadow-lg border border-[#666666]/10 z-10 dropdown-menu"
                              style={{
                                top: selectedRow === item.id ? 'auto' : '100%',
                                bottom: selectedRow === item.id ? '100%' : 'auto',
                                transform: selectedRow === item.id ? 'translateY(0)' : 'translateY(-100%)'
                              }}
                            >
                              <button 
                                className="w-full text-left px-4 py-2 text-xs text-[#666666] hover:bg-gray-100 transition-colors duration-200 rounded-t-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdown(null);
                                }}
                              >
                                Detail
                              </button>
                              <button 
                                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-100 transition-colors duration-200 rounded-b-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelClick(item.id);
                                }}
                              >
                                Cancel Booking
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls 
                currentPage={sessionCurrentPage}
                setCurrentPage={setSessionCurrentPage}
                totalPages={getTotalPages(sessionData)}
              />
            </>
          )}
          
          {activeTab === 'event' && (
            <>
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="relative w-full md:w-[300px]">
                  <input
                    type="text"
                    placeholder="Search"
                    className="h-[35px] w-full rounded-2xl border border-[#666666]/30 pl-10 pr-4 text-xs font-normal font-['Poppins'] text-[#666666]"
                  />
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" size={14} />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#111010] text-white rounded-xl text-xs font-['Poppins']">
                  <FaPlus size={12} />
                  Create
                </button>
              </div>
              <div className="min-w-[768px] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#eaeaea]">
                      <th className="first:rounded-tl-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">No</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Name</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Event</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Date</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Shift</th>
                      <th className="first:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Status</th>
                      <th className="first:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTableData(eventData, eventCurrentPage).map((item) => (
                      <tr 
                        key={item.id} 
                        className={`border-b border-[#666666]/10 hover:bg-gray-100 cursor-pointer transition-colors duration-200`}
                        onClick={() => setSelectedRow(item.id)}
                        onMouseLeave={() => setSelectedRow(null)}
                      >
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.id}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.name}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.event}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.date}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.shift}</td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] text-center">
                          {eventStatuses.find(status => status.id === item.id)?.isCanceled ? (
                            <span className="px-2 py-1 rounded-lg text-xs text-red-800 bg-red-100">
                              Canceled
                            </span>
                          ) : (
                            <select
                              value={eventStatuses.find(status => status.id === item.id)?.status || 'not attend'}
                              onChange={(e) => handleEventStatusChange(item.id, e.target.value)}
                              className={`px-2 py-1 rounded-lg text-xs ${
                                eventStatuses.find(status => status.id === item.id)?.status === 'attend'
                                  ? 'text-green-800 bg-green-100'
                                  : 'text-yellow-800 bg-yellow-100'
                              }`}
                            >
                              <option value="not attend" className="text-yellow-800 bg-white">Not Attend</option>
                              <option value="attend" className="text-green-800 bg-white">Attend</option>
                            </select>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] relative text-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === item.id ? null : item.id);
                            }}
                            className="text-[#666666] hover:text-[#111010] dropdown-trigger"
                          >
                            <FaEllipsisV size={14} />
                          </button>
                          
                          {activeDropdown === item.id && (
                            <div 
                              className="absolute right-0 w-36 bg-white rounded-lg shadow-lg border border-[#666666]/10 z-10 dropdown-menu"
                              style={{
                                top: selectedRow === item.id ? 'auto' : '100%',
                                bottom: selectedRow === item.id ? '100%' : 'auto',
                                transform: selectedRow === item.id ? 'translateY(0)' : 'translateY(-100%)'
                              }}
                            >
                              <button 
                                className="w-full text-left px-4 py-2 text-xs text-[#666666] hover:bg-gray-100 transition-colors duration-200 rounded-t-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdown(null);
                                }}
                              >
                                Detail
                              </button>
                              <button 
                                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-100 transition-colors duration-200 rounded-b-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelClick(item.id);
                                }}
                              >
                                Cancel Booking
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls 
                currentPage={eventCurrentPage}
                setCurrentPage={setEventCurrentPage}
                totalPages={getTotalPages(eventData)}
              />
            </>
          )}
          
          {activeTab === 'membership' && (
            <>
              {/* Statistics Cards */}
              <div className="flex justify-center gap-4 mb-6">
                <div className="bg-white rounded-xl p-2 border border-[#666666]/50 w-[150px] text-center">
                  <p className="text-xs text-[#666666] font-['Poppins'] mb-1">Total Member</p>
                  <p className="text-sm font-medium text-[#111010] font-['Poppins']">100</p>
                </div>
                <div className="bg-white rounded-xl p-2 border border-[#666666]/50 w-[150px] text-center">
                  <p className="text-xs text-[#666666] font-['Poppins'] mb-1">Total Request</p>
                  <p className="text-sm font-medium text-[#111010] font-['Poppins']">20</p>
                </div>
                <div className="bg-white rounded-xl p-2 border border-[#666666]/50 w-[150px] text-center">
                  <p className="text-xs text-[#666666] font-['Poppins'] mb-1">Total Revision</p>
                  <p className="text-sm font-medium text-[#111010] font-['Poppins']">10</p>
                </div>
              </div>

              {/* Search and Create Section */}
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="relative w-full md:w-[300px]">
                  <input
                    type="text"
                    placeholder="Search"
                    className="h-[35px] w-full rounded-2xl border border-[#666666]/30 pl-10 pr-4 text-xs font-normal font-['Poppins'] text-[#666666]"
                  />
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" size={14} />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#111010] text-white rounded-xl text-xs font-['Poppins']">
                  <FaPlus size={12} />
                  Create
                </button>
              </div>
              <div className="min-w-[768px] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#eaeaea]">
                      <th className="first:rounded-tl-xl last:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">No</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Name</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Date Join</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Email</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Phone</th>
                      <th className="first:rounded-tl-xl last:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Status</th>
                      <th className="first:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTableData(membershipData, currentPage).map((item) => (
                      <tr 
                        key={item.id} 
                        className={`border-b border-[#666666]/10 hover:bg-gray-100 cursor-pointer transition-colors duration-200`}
                        onClick={() => setSelectedRow(item.id)}
                        onMouseLeave={() => setSelectedRow(null)}
                      >
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.id}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.name}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.dateJoined}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.email}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.phone}</td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] text-center">
                          <select
                            value={membershipStatuses.find(status => status.id === item.id)?.status || 'request'}
                            onChange={(e) => handleMembershipStatusChange(item.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-xs ${
                              membershipStatuses.find(status => status.id === item.id)?.status === 'verified'
                                ? 'text-green-800 bg-green-100'
                                : membershipStatuses.find(status => status.id === item.id)?.status === 'request'
                                ? 'text-yellow-800 bg-yellow-100'
                                : 'text-red-800 bg-red-100'
                            }`}
                          >
                            <option value="request" className="text-yellow-800 bg-white">Request</option>
                            <option value="verified" className="text-green-800 bg-white">Verified</option>
                            <option value="revision" className="text-red-800 bg-white">Revision</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] relative text-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === item.id ? null : item.id);
                            }}
                            className="text-[#666666] hover:text-[#111010] dropdown-trigger"
                          >
                            <FaEllipsisV size={14} />
                          </button>
                          
                          {activeDropdown === item.id && (
                            <div 
                              className="absolute right-0 w-36 bg-white rounded-lg shadow-lg border border-[#666666]/10 z-10 dropdown-menu"
                              style={{
                                top: selectedRow === item.id ? 'auto' : '100%',
                                bottom: selectedRow === item.id ? '100%' : 'auto',
                                transform: selectedRow === item.id ? 'translateY(0)' : 'translateY(-100%)'
                              }}
                            >
                              <button 
                                className="w-full text-left px-4 py-2 text-xs text-[#666666] hover:bg-gray-100 transition-colors duration-200 rounded-t-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdown(null);
                                }}
                              >
                                Detail
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={getTotalPages(membershipData)} />
            </>
          )}
        </div>
      </div>
      <CancelConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}