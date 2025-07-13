'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IoSearch } from "react-icons/io5";
import { BsGridFill, BsList } from 'react-icons/bs';
import { motion } from 'framer-motion';
import Notification from './Notification';
import AttendanceModal from './AttendanceModal';
import StatusButtonGroup from './StatusButtonGroup';
import AttendanceNavigation from './AttendanceNavigation';
import HistoryPage from './HistoryPage';
import { useAttendanceDashboard } from '@/hooks/useAttendanceDashboard';

const StaffAttendancePage = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const dropdownRef = useRef(null);

  // Use the custom hook for all business logic
  const {
    staff,
    attendanceRecords,
    loading,
    error,
    notification,
    currentTime,
    currentDateTime,
    debugData,
    showDebug,
    fetchDashboardData,
    fetchDebugData,
    forceRefresh,
    handleEvidenceSubmit,
    handleClockOut,
    setNotification,
    setShowDebug,
    getCurrentShiftStaff,
    getActiveShift,
    getFilteredStaff,
    getButtonClass,
    formatShiftTime,
    useMockHour,
    MOCK_HOUR
  } = useAttendanceDashboard();

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle click outside to close dropdown (UI interaction only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // This is just UI interaction, no business logic
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search query changes
  useEffect(() => {
    fetchDashboardData(searchQuery);
  }, [searchQuery]);

  const handleOpenModal = (staff, status, actionLabel = null) => {
    setSelectedAttendance({ staff, status, actionLabel });
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAttendance(null);
  };
  
  const handleEvidenceSubmitWrapper = async (data) => {
    const result = await handleEvidenceSubmit(data);
    if (result.success) {
      handleCloseModal();
    }
  };

  // Get computed values
  const hour = useMockHour ? MOCK_HOUR : new Date().getHours();
  const activeShift = getActiveShift(hour);
  const currentShiftStaff = getCurrentShiftStaff();
  const filteredStaff = getFilteredStaff(searchQuery);

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
        <p className="text-gray-500">Loading staff data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Render History page if active tab is history
  if (activeTab === 'history') {
    return (
      <div className="p-4 md:p-6">
        <AttendanceNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <HistoryPage />
      </div>
    );
  }

  // Render main attendance page
  return (
    <div className="p-4 md:p-6">
      <AttendanceNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Attendance</h1>
          {activeShift && (
            <div className="mt-2 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Current Shift: {formatShiftTime(activeShift)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({currentShiftStaff.length} staff active)
              </span>
            </div>
          )}
          <div className="mt-1 text-sm text-gray-500">
            Total Active Staff: {filteredStaff.length}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={forceRefresh} 
            className="bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded text-sm transition-colors duration-200"
          >
            Force Refresh
          </button>
          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <div className="flex items-center p-1 rounded-lg bg-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow' : 'bg-transparent'}`}
              aria-label="Grid View"
            >
              <BsGridFill className={`text-xl ${viewMode === 'grid' ? 'text-sky-500' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow' : 'bg-transparent'}`}
              aria-label="List View"
            >
              <BsList className={`text-xl ${viewMode === 'list' ? 'text-sky-500' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </div>
      
      <div className={
        viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          : "flex flex-col space-y-4"
      }>
        {filteredStaff.map((staff) => (
          viewMode === 'grid' ? (
            <div key={staff.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center relative">
              {staff.shift === activeShift && (
                <div className="absolute top-2 right-2 group">
                  <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow"></div>
                  <div className="absolute z-20 left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                    Currently Working
                  </div>
                </div>
              )}
              <div className="w-20 h-20 bg-gray-200 rounded-full mb-4"></div>
              <div className="flex-grow mb-4">
                <h3 className="font-semibold text-lg">{staff.name}</h3>
                <p className="text-sm text-gray-500">{staff.department}</p>
                <p className="text-xs text-gray-400 mt-1">{formatShiftTime(staff.shift)}</p>
                {attendanceRecords[staff.id] && attendanceRecords[staff.id].status && (
                  <p className="text-xs text-gray-500 mt-1">
                    Marked at: {attendanceRecords[staff.id][attendanceRecords[staff.id].status]}
                  </p>
                )}
                {attendanceRecords[staff.id]?.earlyCheckout && (
                  <p className="text-xs text-gray-500 mt-1">
                    Clock-out: {attendanceRecords[staff.id].earlyCheckout.timestamp}
                  </p>
                )}
              </div>
              <div className="flex flex-col space-y-2 w-full">
                <StatusButtonGroup
                  staff={staff}
                  attendanceRecords={attendanceRecords}
                  handleOpenModal={handleOpenModal}
                  getButtonClass={getButtonClass}
                  currentDateTime={currentDateTime}
                />
              </div>
            </div>
          ) : (
            <div key={staff.id} className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4 relative">
              {staff.shift === activeShift && (
                <div className="absolute top-2 right-2 group">
                  <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow"></div>
                  <div className="absolute z-20 left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                    Currently Working
                  </div>
                </div>
              )}
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-grow">
                <h3 className="font-semibold">{staff.name}</h3>
                <p className="text-sm text-gray-500">{staff.department}</p>
                <p className="text-xs text-gray-400">{formatShiftTime(staff.shift)}</p>
                {attendanceRecords[staff.id] && (
                  <p className="text-xs text-gray-500">
                    Marked at: {attendanceRecords[staff.id].timestamp}
                  </p>
                )}
                {attendanceRecords[staff.id]?.earlyCheckout && (
                  <p className="text-xs text-gray-500 mt-1">
                    Clock-out: {attendanceRecords[staff.id].earlyCheckout.timestamp}
                  </p>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <StatusButtonGroup
                  staff={staff}
                  attendanceRecords={attendanceRecords}
                  handleOpenModal={handleOpenModal}
                  getButtonClass={getButtonClass}
                  currentDateTime={currentDateTime}
                />
              </div>
            </div>
          )
        ))}
      </div>
      
      {selectedAttendance && (
        <AttendanceModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleEvidenceSubmitWrapper}
          attendanceInfo={selectedAttendance}
        />
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* Debug panel */}
      <div style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 1000 }}>
        <button 
          onClick={() => setShowDebug(!showDebug)} 
          style={{ background: '#333', color: '#fff', padding: '4px 8px', borderRadius: 4 }}
        >
          Debug
        </button>
        {showDebug && (
          <div style={{ background: '#fff', color: '#222', border: '1px solid #333', padding: 12, maxWidth: 400, maxHeight: 400, overflow: 'auto' }}>
            <button 
              onClick={fetchDebugData} 
              style={{ background: '#0070f3', color: '#fff', padding: '2px 8px', borderRadius: 4, marginBottom: 8 }}
            >
              Force Refresh Debug Data
            </button>
            <pre style={{ fontSize: 12 }}>{JSON.stringify(debugData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffAttendancePage; 