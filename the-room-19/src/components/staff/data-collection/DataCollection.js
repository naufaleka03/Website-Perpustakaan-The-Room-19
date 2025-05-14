"use client"
import { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEllipsisV, FaSort } from 'react-icons/fa';
import { membershipData } from './data/membershipData';
import { sessionData } from './data/sessionData';
import { eventData } from './data/eventData';
import { borrowingBookData as initialBorrowingBookData } from './data/borrowingBookData';
import CancelConfirmationModal from './CancelConfirmationModal';
import { useRouter } from 'next/navigation';
import DetailSessionModal from './DetailSessionModal';
import DetailBorrowingModal from './DetailBorrowingModal';

const formatDate = (dateString) => {
  if (!dateString) return ''; // Handle empty date
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateString);
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

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
  const [sessionData, setSessionData] = useState([]);
  const [sessionStatuses, setSessionStatuses] = useState(
    sessionData.map(item => ({
      id: item.id,
      status: 'not attended',
      isCanceled: false
    }))
  );
  const [sessionStatus, setSessionStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [membershipSearchQuery, setMembershipSearchQuery] = useState('');
  const router = useRouter();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' atau 'oldest'
  const [borrowingBookCurrentPage, setBorrowingBookCurrentPage] = useState(1);
  const [borrowingBookSearchQuery, setBorrowingBookSearchQuery] = useState('');
  const [selectedBorrowingData, setSelectedBorrowingData] = useState(null);
  const [isDetailBorrowingModalOpen, setIsDetailBorrowingModalOpen] = useState(false);
  const [borrowingBookData, setBorrowingBookData] = useState(initialBorrowingBookData);

  // Fungsi untuk mendapatkan data yang ditampilkan
  const getTableData = (data, page, itemsPerPage, searchQuery = '') => {
    let filteredData = filterDataByName(data, searchQuery);
    
    // Urutkan data berdasarkan sortOrder
    if (data === sessionData) {
      filteredData = [...filteredData].sort((a, b) => {
        if (sortOrder === 'newest') {
          return b.id - a.id;
        }
        return a.id - b.id;
      });
    }
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  // Fungsi untuk mendapatkan total halaman
  const getTotalPages = (data, itemsPerPage) => Math.ceil(data.length / itemsPerPage);

  // Render pagination controls
  const PaginationControls = ({ currentPage, setCurrentPage, data, itemsPerPage }) => {
    const totalPages = getTotalPages(data, itemsPerPage);

    return (
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-1">
          <span className="text-xs text-[#666666] font-['Poppins']">Show</span>
          <select 
            value={itemsPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-[#666666]/30 rounded px-2 py-1 text-xs text-[#666666]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-xs text-[#666666] font-['Poppins']">entries</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded text-xs ${
              currentPage === 1 
                ? 'bg-gray-100 text-[#666666]/50 cursor-not-allowed' 
                : 'bg-white text-[#666666] border border-[#666666]/30 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <span className="px-2 py-1 bg-[#111010] text-white rounded text-xs">
            {currentPage}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded text-xs ${
              currentPage === totalPages 
                ? 'bg-gray-100 text-[#666666]/50 cursor-not-allowed' 
                : 'bg-white text-[#666666] border border-[#666666]/30 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Update useEffect untuk fetch data
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/sessions');
        const data = await response.json();
        // Sort data berdasarkan created_at
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB - dateA; // Default newest first
        });
        
        setSessionData(sortedData);
        setSessionStatuses(
          sortedData.map(item => ({
            id: item.id,
            status: item.status || 'not attended',
            isCanceled: item.status === 'canceled'
          }))
        );
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };
    
    fetchSessions();
  }, [isModalOpen]);

  // Update handler untuk mengubah status session
  const handleSessionStatusChange = async (sessionId, newStatus) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (response.ok) {
        setSessionStatuses(prevStatuses =>
          prevStatuses.map(status =>
            status.id === sessionId
              ? { ...status, status: newStatus }
              : status
          )
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Update state untuk event
  const [eventStatuses, setEventStatuses] = useState(
    eventData.map(item => ({
      id: item.id,
      status: 'not attended',
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

  // Pisahkan fungsi untuk menangani klik cancel booking dan konfirmasi cancel
  const handleCancelClick = (sessionId) => {
    setSelectedBookingId(sessionId);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleCancelConfirm = async (sessionId) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'canceled' })
      });
  
      if (response.ok) {
        setSessionStatuses(prevStatuses =>
          prevStatuses.map(status =>
            status.id === sessionId
              ? { ...status, status: 'canceled', isCanceled: true }
              : status
          )
        );
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
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

  // Fungsi untuk mendapatkan data sesuai halaman
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return sessionData.slice(startIndex, endIndex);
  };

  // Update filterDataByName function to handle book search
  const filterDataByName = (data, query) => {
    if (data === borrowingBookData) {
      return data.filter(item => 
        item.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.book?.toLowerCase().includes(query.toLowerCase())
      );
    }
    return data.filter(item => 
      item.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      item.name?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Update event handler untuk search input
  const handleSearch = (e, setSearchFn) => {
    setSearchFn(e.target.value);
    setCurrentPage(1); // Reset halaman ke 1 ketika melakukan pencarian
  };

  const handleDetail = (sessionId) => {
    setSelectedSessionId(sessionId);
    setIsDetailModalOpen(true);
    setActiveDropdown(null);
  };

  // Tambahkan useEffect untuk handle click outside sort dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.sort-container')) {
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update fungsi handleSort
  const handleSort = (order) => {
    setSortOrder(order);
    setSortDropdownOpen(false);
    
    const sortedData = [...sessionData].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      
      if (order === 'newest') {
        return dateB - dateA;
      }
      return dateA - dateB;
    });
    
    setSessionData(sortedData);
    setSessionCurrentPage(1);
  };

  // Fungsi untuk mengecek status peminjaman
  const getBorrowingStatus = (returnDate, status) => {
    if (status === 'returned') return 'returned';
    
    const today = new Date();
    const returnDateObj = new Date(returnDate);
    
    if (today > returnDateObj) {
      return 'overdue';
    }
    return 'ongoing';
  };

  // Fungsi untuk menangani pengembalian buku
  const handleReturnBook = async (bookId) => {
    try {
      // Update status buku menjadi returned
      const updatedData = borrowingBookData.map(item => {
        if (item.id === bookId) {
          return { ...item, status: 'returned' };
        }
        return item;
      });
      
      // Update state
      setBorrowingBookData(updatedData);
      setIsDetailBorrowingModalOpen(false);
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative mb-4">
        <div className="bg-gradient-to-l from-[#4d4d4d] to-black w-full h-[200px] flex items-center">
          <div className="max-w-[1440px] w-full mx-auto px-4 lg:px-8">
            <h1 className={`text-[#fcfcfc] text-5xl font-medium leading-[48px] font-manrope`}>
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
          <button
            onClick={() => setActiveTab('borrowing')}
            className={`px-6 py-3 text-sm transition-all relative ${
              activeTab === 'borrowing'
                ? 'text-[#111010] font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#111010]'
                : 'text-[#666666]'
            }`}
          >
            Borrowing Book
          </button>
        </div>

        {/* Tables Section */}
        <div className="w-full overflow-x-auto">
          {activeTab === 'session' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e, setSearchQuery)}
                      className="w-[360px] h-[35px] rounded-2xl border border-[#666666]/30 pl-9 pr-4 text-xs font-normal font-['Poppins'] text-[#666666]"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
                  </div>
                  
                  {/* Sort Dropdown */}
                  <div className="relative sort-container">
                    <button
                      onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#666666]/30 text-xs font-normal font-['Poppins'] text-[#666666]"
                    >
                      <FaSort />
                      Sort
                    </button>
                    
                    {sortDropdownOpen && (
                      <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-lg border border-[#666666]/10 py-1 z-10 min-w-[150px]">
                        <button
                          onClick={() => handleSort('newest')}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-100 transition-colors duration-200 ${
                            sortOrder === 'newest' ? 'text-[#111010] font-medium' : 'text-[#666666]'
                          }`}
                        >
                          Newest First
                        </button>
                        <button
                          onClick={() => handleSort('oldest')}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-100 transition-colors duration-200 ${
                            sortOrder === 'oldest' ? 'text-[#111010] font-medium' : 'text-[#666666]'
                          }`}
                        >
                          Oldest First
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => router.push('/staff/dashboard/data-collection/create-session')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#111010] text-white rounded-xl text-xs font-['Poppins']"
                >
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
                      <th className="last:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTableData(sessionData, sessionCurrentPage, entriesPerPage, searchQuery).map((session, index) => (
                      <tr 
                        key={session.id} 
                        className={`border-b border-[#666666]/10 hover:bg-gray-100 cursor-pointer transition-colors duration-200`}
                        onClick={() => setSelectedRow(session.id)}
                        onMouseLeave={() => setSelectedRow(null)}
                      >
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {(sessionCurrentPage - 1) * entriesPerPage + index + 1}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{session.full_name}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {formatDate(session.arrival_date)}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{session.shift_name}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{session.category}</td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] text-center">
                          {sessionStatuses.find(status => status.id === session.id)?.status === 'canceled' ? (
                            <span className="px-2 py-1 rounded-lg text-xs text-red-800 bg-red-100">
                              Canceled
                            </span>
                          ) : (
                            <select
                              value={sessionStatuses.find(status => status.id === session.id)?.status || 'not attended'}
                              onChange={(e) => handleSessionStatusChange(session.id, e.target.value)}
                              className={`px-2 py-1 rounded-lg text-xs ${
                                sessionStatuses.find(status => status.id === session.id)?.status === 'attended'
                                  ? 'text-green-800 bg-green-100'
                                  : 'text-yellow-800 bg-yellow-100'
                              }`}
                            >
                              <option value="not attended" className="text-yellow-800 bg-white">Not Attended</option>
                              <option value="attended" className="text-green-800 bg-white">Attended</option>
                            </select>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] text-center relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === session.id ? null : session.id);
                            }}
                            className="hover:bg-gray-100 p-2 rounded-full dropdown-trigger"
                          >
                            <FaEllipsisV className="text-[#666666]" />
                          </button>
                          
                          {activeDropdown === session.id && (
                            <div 
                              className="absolute right-0 w-36 bg-white rounded-lg shadow-lg border border-[#666666]/10 z-10 dropdown-menu"
                              style={{
                                top: selectedRow === session.id ? 'auto' : '100%',
                                bottom: selectedRow === session.id ? '100%' : 'auto',
                                transform: selectedRow === session.id ? 'translateY(0)' : 'translateY(-100%)'
                              }}
                            >
                              <button 
                                className="w-full text-left px-4 py-2 text-xs text-[#666666] hover:bg-gray-100 transition-colors duration-200 rounded-t-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDetail(session.id);
                                }}
                              >
                                Detail
                              </button>
                              <button 
                                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-b-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelClick(session.id);
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
                data={sessionData}
                itemsPerPage={entriesPerPage}
              />
            </>
          )}
          
          {activeTab === 'event' && (
            <>
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name"
                    value={eventSearchQuery}
                    onChange={(e) => handleSearch(e, setEventSearchQuery)}
                    className="w-[360px] h-[35px] rounded-2xl border border-[#666666]/30 pl-9 pr-4 text-xs font-normal font-['Poppins'] text-[#666666]"
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
                </div>
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-[#111010] text-white rounded-xl text-xs font-['Poppins']"
                  onClick={() => router.push('/staff/dashboard/data-collection/create-event')}
                >
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
                      <th className="last:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTableData(eventData, eventCurrentPage, entriesPerPage, eventSearchQuery).map((item, index) => (
                      <tr 
                        key={item.id} 
                        className={`border-b border-[#666666]/10 hover:bg-gray-100 cursor-pointer transition-colors duration-200`}
                        onClick={() => setSelectedRow(item.id)}
                        onMouseLeave={() => setSelectedRow(null)}
                      >
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {(eventCurrentPage - 1) * entriesPerPage + index + 1}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.name}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.event}</td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {formatDate(item.arrival_date)}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">{item.shift}</td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] text-center">
                          {eventStatuses.find(status => status.id === item.id)?.isCanceled ? (
                            <span className="px-2 py-1 rounded-lg text-xs text-red-800 bg-red-100">
                              Canceled
                            </span>
                          ) : (
                            <select
                              value={eventStatuses.find(status => status.id === item.id)?.status || 'not attended'}
                              onChange={(e) => handleEventStatusChange(item.id, e.target.value)}
                              className={`px-2 py-1 rounded-lg text-xs ${
                                eventStatuses.find(status => status.id === item.id)?.status === 'attended'
                                  ? 'text-green-800 bg-green-100'
                                  : 'text-yellow-800 bg-yellow-100'
                              }`}
                            >
                              <option value="not attended" className="text-yellow-800 bg-white">Not Attended</option>
                              <option value="attended" className="text-green-800 bg-white">Attended</option>
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
                                  handleDetail(item.id);
                                }}
                              >
                                Detail
                              </button>
                              <button 
                                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-b-lg"
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
                data={eventData}
                itemsPerPage={entriesPerPage}
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
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name"
                    value={membershipSearchQuery}
                    onChange={(e) => handleSearch(e, setMembershipSearchQuery)}
                    className="w-[360px] h-[35px] rounded-2xl border border-[#666666]/30 pl-9 pr-4 text-xs font-normal font-['Poppins'] text-[#666666]"
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
                </div>
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-[#111010] text-white rounded-xl text-xs font-['Poppins']"
                  onClick={() => router.push('/staff/dashboard/data-collection/create-membership')}
                >
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
                      <th className="last:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTableData(membershipData, currentPage, entriesPerPage, membershipSearchQuery).map((item, index) => (
                      <tr 
                        key={item.id} 
                        className={`border-b border-[#666666]/10 hover:bg-gray-100 cursor-pointer transition-colors duration-200`}
                        onClick={() => setSelectedRow(item.id)}
                        onMouseLeave={() => setSelectedRow(null)}
                      >
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {(currentPage - 1) * entriesPerPage + index + 1}
                        </td>
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
                                  handleDetail(item.id);
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
              <PaginationControls currentPage={currentPage} setCurrentPage={setCurrentPage} data={membershipData} itemsPerPage={entriesPerPage} />
            </>
          )}

          {activeTab === 'borrowing' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or book title"
                    value={borrowingBookSearchQuery}
                    onChange={(e) => handleSearch(e, setBorrowingBookSearchQuery)}
                    className="w-[360px] h-[35px] rounded-2xl border border-[#666666]/30 pl-9 pr-4 text-xs font-normal font-['Poppins'] text-[#666666]"
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
                </div>
              </div>
              <div className="min-w-[768px] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#eaeaea]">
                      <th className="first:rounded-tl-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">No</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Name</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Book</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Email</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Phone Number</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Status</th>
                      <th className="last:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTableData(borrowingBookData, borrowingBookCurrentPage, entriesPerPage, borrowingBookSearchQuery).map((item, index) => {
                      const status = getBorrowingStatus(item.return_date, item.status);
                      return (
                        <tr 
                          key={item.id} 
                          className="border-b border-[#666666]/10 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <td className="py-4 px-4 text-xs text-[#666666] font-['Poppins']">
                            {(borrowingBookCurrentPage - 1) * entriesPerPage + index + 1}
                          </td>
                          <td className="py-4 px-4 text-xs text-[#666666] font-['Poppins']">{item.name}</td>
                          <td className="py-4 px-4 text-xs text-[#666666] font-['Poppins']">{item.book}</td>
                          <td className="py-4 px-4 text-xs text-[#666666] font-['Poppins']">{item.email}</td>
                          <td className="py-4 px-4 text-xs text-[#666666] font-['Poppins']">{item.phone}</td>
                          <td className="py-4 px-4 text-xs font-['Poppins'] text-center whitespace-nowrap min-w-[90px]">
                            <span className={`px-2 py-1 rounded-lg text-xs whitespace-nowrap ${
                              status === 'returned'
                                ? 'text-green-800 bg-green-100'
                                : status === 'overdue'
                                ? 'text-red-800 bg-red-100'
                                : 'text-yellow-800 bg-yellow-100'
                            }`}>
                              {status === 'returned'
                                ? 'Returned'
                                : status === 'overdue'
                                ? 'Over Due'
                                : 'On Going'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs font-['Poppins'] text-center relative">
                          <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBorrowingData(item);
                                setActiveDropdown(item.id); // Tampilkan dropdown untuk item ini
                              }}
                              className="text-[#666666] hover:text-[#111010] dropdown-trigger"
                            >
                              <FaEllipsisV size={14} />
                          </button>
                                                        
                            {activeDropdown === item.id && (
                              <div className="absolute right-0 w-36 bg-white rounded-lg shadow-lg border border-[#666666]/10 z-10 dropdown-menu">
                                <button 
                                  className="w-full text-left px-4 py-2 text-xs text-[#666666] hover:bg-gray-100 transition-colors duration-200 rounded-lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBorrowingData(item);
                                    setIsDetailBorrowingModalOpen(true); // Baru buka modal di sini
                                    setActiveDropdown(null);
                                  }}
                                >
                                  Detail
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationControls 
                currentPage={borrowingBookCurrentPage}
                setCurrentPage={setBorrowingBookCurrentPage}
                data={borrowingBookData}
                itemsPerPage={entriesPerPage}
              />
            </>
          )}
        </div>
      </div>
      <CancelConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCancelConfirm}
        selectedBookingId={selectedBookingId}
      />
      <DetailSessionModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        sessionId={selectedSessionId}
      />
      <DetailBorrowingModal 
        isOpen={isDetailBorrowingModalOpen}
        onClose={() => setIsDetailBorrowingModalOpen(false)}
        borrowingData={selectedBorrowingData}
        onReturnBook={handleReturnBook}
      />
    </div>
  );
}