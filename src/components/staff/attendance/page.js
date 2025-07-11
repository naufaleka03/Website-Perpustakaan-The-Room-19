'use client';

import React, { useState, useEffect } from 'react';
import { IoSearch } from "react-icons/io5";
import { BsGridFill, BsList } from 'react-icons/bs';
import { motion } from 'framer-motion';
import Notification from './Notification';
import AttendanceModal from './AttendanceModal';
import EarlyCheckoutModal from './EarlyCheckoutModal';
import StatusButtonGroup from './StatusButtonGroup';
import AttendanceNavigation from './AttendanceNavigation';
import HistoryPage from './HistoryPage';
import { STATUS_MAP, getActiveShift, canEarlyCheckout } from './utils';

const StaffAttendancePage = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isEarlyCheckoutModalOpen, setIsEarlyCheckoutModalOpen] = useState(false);
  const [selectedStaffForCheckout, setSelectedStaffForCheckout] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [debugData, setDebugData] = useState({});
  const [showDebug, setShowDebug] = useState(false);

  // Mock hour for testing shift logic
  const MOCK_HOUR = 10; // Change this to 14 for shift B, 18 for shift C, etc.
  const useMockHour = true; // Set to false to use real time

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(timeString);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch staff data
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch('/api/staff/attendance');
        if (!response.ok) throw new Error('Failed to fetch staff data');
        const data = await response.json();
        setStaff(data.staff);
      } catch (error) {
        setError('Failed to load staff data');
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // Fetch attendance records for today
  const fetchAttendanceRecords = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      // Only fetch today's records for dashboard logic
      const response = await fetch(`/api/staff/attendance/records?date=${today}`);
      if (response.ok) {
        const data = await response.json();
        console.log('API attendance records response:', data.records);
        const recordsMap = {};
        // Support multiple records per staff per day (for different statuses)
        data.records.forEach(record => {
          if (!recordsMap[record.staff_id]) {
            recordsMap[record.staff_id] = { statuses: [] };
          }
          recordsMap[record.staff_id].statuses.push(record.status);
          // Save the latest timestamp for each status
          recordsMap[record.staff_id][record.status] = record.timestamp;
        });
        // For convenience, set .status to the latest of P, A, L, CO, ECO if present
        Object.keys(recordsMap).forEach(staffId => {
          const s = recordsMap[staffId].statuses;
          if (s.includes('CO')) recordsMap[staffId].status = 'CO';
          else if (s.includes('ECO')) recordsMap[staffId].status = 'ECO';
          else if (s.includes('P')) recordsMap[staffId].status = 'P';
          else if (s.includes('L')) recordsMap[staffId].status = 'L';
          else if (s.includes('A')) recordsMap[staffId].status = 'A';
          // Early checkout info
          if (s.includes('ECO')) {
            recordsMap[staffId].earlyCheckout = {
              status: 'ECO',
              timestamp: recordsMap[staffId]['ECO']
            };
          } else if (s.includes('CO')) {
            recordsMap[staffId].earlyCheckout = {
              status: 'CO',
              timestamp: recordsMap[staffId]['CO']
            };
          }
        });
        console.log('Processed attendanceRecords:', recordsMap);
        setAttendanceRecords(recordsMap);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setAttendanceRecords({});
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  useEffect(() => {
    console.log('attendanceRecords state:', attendanceRecords);
  }, [attendanceRecords]);

  // Fetch debug data
  const fetchDebugData = async () => {
    try {
      const res = await fetch('/api/staff/attendance/records?debug=1');
      const data = await res.json();
      setDebugData(data);
    } catch (e) {
      setDebugData({ error: e.message });
    }
  };

  // Add a force refresh button to refetch staff and attendance records
  const forceRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const staffRes = await fetch('/api/staff/attendance');
      const staffData = await staffRes.json();
      setStaff(staffData.staff);
      await fetchAttendanceRecords();
    } catch (e) {
      setError('Failed to force refresh');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(staff =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (staff, status, actionLabel = null) => {
    setSelectedAttendance({ staff, status, actionLabel });
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAttendance(null);
  };
  
  const handleEvidenceSubmit = async (data) => {
    if (data.error) {
      setNotification({ message: data.error, type: 'error' });
      return;
    }
    try {
      const response = await fetch(data.imageSrc);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('evidence', blob, 'evidence.jpg');
      // Always use selectedAttendance.staff.id for staffNo
      formData.append('staffNo', selectedAttendance.staff.id);
      formData.append('status', data.status);
      formData.append('timestamp', data.timestamp);
      const apiResponse = await fetch('/api/staff/attendance', {
        method: 'POST',
        body: formData,
      });
      if (!apiResponse.ok) throw new Error('Failed to submit attendance');
      const responseData = await apiResponse.json();
      // Optimistically update attendanceRecords for instant UI feedback
      setAttendanceRecords(prev => {
        const prevStaff = prev[selectedAttendance.staff.id] || { statuses: [] };
        const newStatuses = [...prevStaff.statuses, data.status];
        const newRecord = {
          ...prevStaff,
          statuses: newStatuses,
          [data.status]: data.timestamp,
          status: data.status // set the latest status
        };
        return {
          ...prev,
          [selectedAttendance.staff.id]: newRecord
        };
      });
      // Refetch attendance records from backend to ensure UI is up to date
      await fetchAttendanceRecords();
      setNotification({
        message: `Attendance recorded for ${selectedAttendance.staff.name} at ${data.timestamp}!`,
        type: 'success'
      });
      handleCloseModal();
    } catch (error) {
      setNotification({ message: 'Failed to submit attendance. Please try again.', type: 'error' });
    }
  };

  // Clock-out handlers
  const handleClockOutClick = (staff, isEarly = false) => {
    handleOpenModal(staff, isEarly ? 'ECO' : 'CO', isEarly ? 'Early Clock-Out' : 'Clock-out');
  };
  
  const handleCloseEarlyCheckoutModal = () => {
    setIsEarlyCheckoutModalOpen(false);
    setSelectedStaffForCheckout(null);
  };
  
  const handleConfirmEarlyCheckout = async () => {
    try {
      const formData = new FormData();
      formData.append('staffNo', selectedStaffForCheckout.id);
      formData.append('status', 'ECO');
      formData.append('timestamp', currentTime);
      const apiResponse = await fetch('/api/staff/attendance', {
        method: 'POST',
        body: formData,
      });
      if (!apiResponse.ok) throw new Error('Failed to submit clock-out');
      const responseData = await apiResponse.json();
      
      // Refetch attendance records from backend to ensure UI is up to date
      await fetchAttendanceRecords();
      
      setNotification({
        message: `Clock-out recorded for ${selectedStaffForCheckout.name} at ${currentTime}!`,
        type: 'success'
      });
      handleCloseEarlyCheckoutModal();
    } catch (error) {
      setNotification({ message: 'Failed to submit clock-out. Please try again.', type: 'error' });
    }
  };

  // Helper for button class
  const getButtonClass = (staffNo, status, baseClass) => {
    const currentRecord = attendanceRecords[staffNo];
    if (currentRecord) {
      if (currentRecord.earlyCheckout) return `${baseClass} bg-gray-300 text-gray-800`;
      if (currentRecord.status === status) {
        const colors = {
          P: 'bg-green-500 text-white',
          A: 'bg-red-500 text-white',
          L: 'bg-orange-500 text-white'
        };
        return `${baseClass} ${colors[status]}`;
      }
      return `${baseClass} bg-gray-200 text-gray-400 cursor-not-allowed`;
    }
    return `${baseClass} bg-gray-300 text-gray-800`;
  };

  // Shift logic
  const hour = useMockHour ? MOCK_HOUR : new Date().getHours();
  const activeShift = getActiveShift(hour);

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
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <div className="flex items-center space-x-4">
          <button onClick={forceRefresh} className="bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded text-sm transition-colors duration-200">Force Refresh</button>
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
                />
                {/* Show Early Clock-Out button only if checked in (P, L, or A) and not already checked out early or clocked out */}
                {attendanceRecords[staff.id] && ["P", "L", "A"].includes(attendanceRecords[staff.id].status) && !attendanceRecords[staff.id]?.earlyCheckout ? (
                  <button
                    onClick={() => handleClockOutClick(staff, true)}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded text-sm transition-colors duration-200 mt-2"
                  >
                    Early Clock-Out
                  </button>
                ) : null}
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
                />
                {/* Show Early Clock-Out button only if checked in (P, L, or A) and not already checked out early or clocked out */}
                {attendanceRecords[staff.id] && ["P", "L", "A"].includes(attendanceRecords[staff.id].status) && !attendanceRecords[staff.id]?.earlyCheckout ? (
                  <button
                    onClick={() => handleClockOutClick(staff, true)}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded text-sm transition-colors duration-200 mt-2"
                  >
                    Early Clock-Out
                  </button>
                ) : null}
              </div>
            </div>
          )
        ))}
      </div>
      {selectedAttendance && (
        <AttendanceModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleEvidenceSubmit}
          attendanceInfo={selectedAttendance}
        />
      )}
      {selectedStaffForCheckout && (
        <EarlyCheckoutModal
          isOpen={isEarlyCheckoutModalOpen}
          onClose={handleCloseEarlyCheckoutModal}
          onConfirm={handleConfirmEarlyCheckout}
          staff={selectedStaffForCheckout}
          currentTime={currentTime}
        />
      )}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Add a debug panel UI */}
      <div style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 1000 }}>
        <button onClick={() => setShowDebug(!showDebug)} style={{ background: '#333', color: '#fff', padding: '4px 8px', borderRadius: 4 }}>Debug</button>
        {showDebug && (
          <div style={{ background: '#fff', color: '#222', border: '1px solid #333', padding: 12, maxWidth: 400, maxHeight: 400, overflow: 'auto' }}>
            <button onClick={fetchDebugData} style={{ background: '#0070f3', color: '#fff', padding: '2px 8px', borderRadius: 4, marginBottom: 8 }}>Force Refresh Debug Data</button>
            <pre style={{ fontSize: 12 }}>{JSON.stringify(debugData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffAttendancePage;  