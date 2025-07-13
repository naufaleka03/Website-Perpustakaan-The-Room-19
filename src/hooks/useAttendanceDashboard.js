import { useState, useEffect } from 'react';

/**
 * Custom hook for attendance dashboard functionality
 * Replaces logic previously in the frontend component
 */
export function useAttendanceDashboard() {
  const [staff, setStaff] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
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
      setCurrentDateTime(now);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = async (searchQuery = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const hour = useMockHour ? MOCK_HOUR : new Date().getHours();
      const params = new URLSearchParams({
        hour: hour.toString(),
        search: searchQuery,
        useMockHour: useMockHour.toString()
      });

      const response = await fetch(`/api/staff/attendance/dashboard?${params}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await response.json();
      
      if (data.success) {
        setStaff(data.data.allStaff);
        setAttendanceRecords(data.data.attendanceRecords);
        
        // Log any Non-Active staff for debugging
        if (data.data.nonActiveStaff.length > 0) {
          console.warn('Non-Active staff found in API response:', data.data.nonActiveStaff);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Force refresh dashboard data
  const forceRefresh = async () => {
    await fetchDashboardData();
  };

  // Submit attendance action
  const submitAttendanceAction = async (actionData) => {
    try {
      const formData = new FormData();
      formData.append('action', actionData.action || 'submit_attendance');
      formData.append('staffNo', actionData.staffNo);
      formData.append('status', actionData.status);
      formData.append('timestamp', actionData.timestamp);
      
      if (actionData.evidence) {
        formData.append('evidence', actionData.evidence);
      }

      const response = await fetch('/api/staff/attendance/actions', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to submit attendance action');
      
      const result = await response.json();
      
      if (result.success) {
        // Update attendance records with the response
        setAttendanceRecords(result.updatedRecords);
        
        setNotification({
          message: result.message,
          type: 'success'
        });
        
        return { success: true, data: result };
      } else {
        throw new Error(result.error || 'Failed to submit attendance action');
      }
    } catch (error) {
      setNotification({ 
        message: 'Failed to submit attendance action. Please try again.', 
        type: 'error' 
      });
      return { success: false, error: error.message };
    }
  };

  // Handle evidence submit (for attendance modal)
  const handleEvidenceSubmit = async (data) => {
    if (data.error) {
      setNotification({ message: data.error, type: 'error' });
      return { success: false, error: data.error };
    }

    try {
      const response = await fetch(data.imageSrc);
      const blob = await response.blob();
      
      const result = await submitAttendanceAction({
        action: 'submit_attendance',
        staffNo: data.staffNo,
        status: data.status,
        timestamp: data.timestamp,
        evidence: blob
      });

      if (result.success) {
        setNotification({
          message: `Attendance recorded successfully!`,
          type: 'success'
        });
      }
      
      return result;
    } catch (error) {
      setNotification({ 
        message: 'Failed to submit attendance. Please try again.', 
        type: 'error' 
      });
      return { success: false, error: error.message };
    }
  };

  // Handle clock-out
  const handleClockOut = async (staffId, isEarly = false) => {
    try {
      const result = await submitAttendanceAction({
        action: isEarly ? 'early_clock_out' : 'clock_out',
        staffNo: staffId,
        status: isEarly ? 'ECO' : 'CO',
        timestamp: currentTime
      });

      if (result.success) {
        const actionType = isEarly ? 'Early Clock-out' : 'Clock-out';
        setNotification({
          message: `${actionType} recorded successfully!`,
          type: 'success'
        });
      }
      
      return result;
    } catch (error) {
      setNotification({ 
        message: 'Failed to submit clock-out. Please try again.', 
        type: 'error' 
      });
      return { success: false, error: error.message };
    }
  };

  // Get current shift staff
  const getCurrentShiftStaff = () => {
    const hour = useMockHour ? MOCK_HOUR : new Date().getHours();
    const activeShift = getActiveShift(hour);
    if (!activeShift) return [];
    
    return staff
      .filter(staffMember => staffMember.shift === activeShift)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Get active shift
  const getActiveShift = (hour = new Date().getHours()) => {
    if (hour >= 10 && hour < 14) return 'A';
    if (hour >= 14 && hour < 18) return 'B';
    if (hour >= 18 && hour < 22) return 'C';
    return null;
  };

  // Filter staff by search query
  const getFilteredStaff = (searchQuery = '') => {
    return staff.filter(staffMember =>
      staffMember.status === 'Active' && 
      staffMember.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Get button class for status buttons
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

  // Format shift time
  const formatShiftTime = (shift) => {
    const shiftInfo = {
      A: { name: 'Shift A', startTime: '10:00', endTime: '14:00' },
      B: { name: 'Shift B', startTime: '14:01', endTime: '18:00' },
      C: { name: 'Shift C', startTime: '18:01', endTime: '22:00' }
    };
    
    const info = shiftInfo[shift];
    if (!info) return 'Unknown Shift';
    
    return `${info.name} (${info.startTime} - ${info.endTime})`;
  };

  return {
    // State
    staff,
    attendanceRecords,
    loading,
    error,
    notification,
    currentTime,
    currentDateTime,
    debugData,
    showDebug,
    
    // Actions
    fetchDashboardData,
    fetchDebugData,
    forceRefresh,
    submitAttendanceAction,
    handleEvidenceSubmit,
    handleClockOut,
    setNotification,
    setShowDebug,
    
    // Computed values
    getCurrentShiftStaff,
    getActiveShift,
    getFilteredStaff,
    getButtonClass,
    formatShiftTime,
    
    // Constants
    useMockHour,
    MOCK_HOUR
  };
} 