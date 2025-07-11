'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IoSearch } from "react-icons/io5";
import { IoCalendarOutline } from "react-icons/io5";
import { STATUS_MAP } from './utils';

const HistoryPage = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const dateInputRef = useRef(null);
  // Add state for display date string
  const [displayDateString, setDisplayDateString] = useState('');
  const [debugData, setDebugData] = useState({});
  const [showDebug, setShowDebug] = useState(false);

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
      }
    };
    fetchStaff();
  }, []);

  // Quick date selection
  const quickDateOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This week', value: 'thisweek' },
    { label: 'This month', value: 'thismonth' }
  ];

  // Helper to get date range for API
  const getDateRange = (option) => {
    const now = new Date();
    if (option === 'today') {
      const today = now.toISOString().split('T')[0];
      return { start: today, end: today };
    } else if (option === 'thisweek') {
      const first = now.getDate() - now.getDay();
      const last = first + 6;
      const firstDay = new Date(now.setDate(first));
      const lastDay = new Date(now.setDate(last));
      return {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0]
      };
    } else if (option === 'thismonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0]
      };
    }
    // Default to today
    const today = new Date().toISOString().split('T')[0];
    return { start: today, end: today };
  };

  const [selectedRange, setSelectedRange] = useState('today');

  // Fetch attendance records
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        setLoading(true);
        const { start, end } = getDateRange(selectedRange);
        const response = await fetch(`/api/staff/attendance/records?start_date=${start}&end_date=${end}`);
        if (response.ok) {
          const data = await response.json();
          setAttendanceRecords(data.records || []);
        } else {
          setAttendanceRecords([]);
        }
      } catch (error) {
        setAttendanceRecords([]);
      } finally {
        setLoading(false);
      }
    };
    if (selectedRange) {
      fetchAttendanceRecords();
    }
  }, [selectedRange]);

  useEffect(() => {
    // Update display date string when selectedRange changes
    const { start, end } = getDateRange(selectedRange);
    let label = '';
    if (selectedRange === 'today') {
      const dateObj = new Date(start);
      label = dateObj.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } else if (selectedRange === 'thisweek') {
      const startObj = new Date(start);
      const endObj = new Date(end);
      label = `${startObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (selectedRange === 'thismonth') {
      const startObj = new Date(start);
      label = startObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    setDisplayDateString(label);
  }, [selectedRange]);

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

  // Remove staff, status, and search filters
  // Only keep Quick Date Selection and show all records for the selected date range

  // Remove filteredRecords, just use attendanceRecords

  // Get staff name by ID
  const getStaffName = (staffId) => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember ? staffMember.name : 'Unknown Staff';
  };
  // Get staff department by ID
  const getStaffDepartment = (staffId) => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember ? staffMember.department : 'Unknown Department';
  };
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };
  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      P: 'bg-green-100 text-green-800',
      A: 'bg-red-100 text-red-800',
      L: 'bg-orange-100 text-orange-800',
      CO: 'bg-blue-100 text-blue-800',
      EC: 'bg-yellow-100 text-yellow-800',
      ECO: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Quick date selection
  const handleQuickDateSelect = (value) => {
    setSelectedDate(value);
    // Explicitly blur the date input to prevent sticky focus
    if (dateInputRef.current) {
      dateInputRef.current.blur();
    }
  };

  // Debug: Log fetched data
  useEffect(() => {
    console.log('Fetched attendanceRecords:', attendanceRecords);
    console.log('Fetched staff:', staff);
  }, [attendanceRecords, staff]);

  if (loading && attendanceRecords.length === 0) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading attendance history...</p>
        </div>
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

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Attendance History</h1>
        <p className="text-gray-600">View staff attendance records</p>
      </div>

      {/* Quick Date Selection */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Date Selection</h3>
        <div className="flex flex-wrap gap-2">
          {quickDateOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedRange(option.value)}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                selectedRange === option.value
                  ? 'bg-sky-500 text-white border-sky-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{attendanceRecords.length}</span> records
              {displayDateString && ` for ${displayDateString}`}
            </p>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {attendanceRecords.length === 0 ? (
          <div className="p-8 text-center">
            <IoCalendarOutline className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">No attendance records found</p>
            <p className="text-sm text-gray-400">Try selecting a different date</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record, index) => {
                  const timestamp = new Date(record.timestamp);
                  const dateStr = timestamp.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  const timeStr = timestamp.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  });
                  return (
                    <tr key={`${record.staff_id}-${record.timestamp}-${index}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getStaffName(record.staff_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {getStaffDepartment(record.staff_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(record.status)}`}>
                          {STATUS_MAP[record.status] || record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dateStr}</div>
                        <div className="text-sm text-gray-500 font-mono">{timeStr}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export Button */}
      {attendanceRecords.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              // TODO: Implement export functionality
              alert('Export functionality will be implemented here');
            }}
            className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export to CSV</span>
          </button>
        </div>
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

export default HistoryPage; 