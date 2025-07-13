import { useState, useEffect } from 'react';

/**
 * Custom hook for attendance history functionality
 * Replaces logic previously in HistoryPage component
 */
export function useAttendanceHistory() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState('today');
  const [displayDateString, setDisplayDateString] = useState('');

  // Quick date selection options
  const quickDateOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This week', value: 'thisweek' },
    { label: 'This month', value: 'thismonth' }
  ];

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

  // Fetch attendance records
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          range: selectedRange
        });

        const response = await fetch(`/api/staff/attendance/history?${params}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAttendanceRecords(data.records || []);
          } else {
            setAttendanceRecords([]);
          }
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

  // Update display date string when selectedRange changes
  useEffect(() => {
    const { start, end } = getDateRange(selectedRange);
    let label = '';
    
    if (selectedRange === 'today') {
      const dateObj = new Date(start);
      label = dateObj.toLocaleDateString('en-US', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
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

  // Helper function to get date range
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

  // Handle quick date selection
  const handleQuickDateSelect = (value) => {
    setSelectedRange(value);
  };

  return {
    // State
    attendanceRecords,
    staff,
    loading,
    error,
    selectedRange,
    displayDateString,
    quickDateOptions,

    // Actions
    setSelectedRange,
    handleQuickDateSelect,

    // Utility functions
    getStaffName,
    getStaffDepartment,
    formatTimestamp,
    getStatusBadgeColor,
    getDateRange
  };
} 