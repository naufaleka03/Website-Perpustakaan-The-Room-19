import { useState, useEffect } from 'react';

/**
 * Custom hook for employee management functionality
 * Replaces business logic previously in the employee page
 */
export function useEmployeeManagement() {
  const [currentView, setCurrentView] = useState('view_employees');
  const [notification, setNotification] = useState(null);
  const [showBlankPage, setShowBlankPage] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [evidenceModalUrl, setEvidenceModalUrl] = useState(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  // Payroll data state
  const [payrollStaff, setPayrollStaff] = useState([]);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollError, setPayrollError] = useState(null);

  // Attendance data state
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);

  // Fetch payroll data
  useEffect(() => {
    if (showBlankPage) {
      fetchPayrollData();
    }
  }, [showBlankPage]);

  // Fetch attendance data
  useEffect(() => {
    if (showAttendance) {
      fetchAttendanceData();
    }
  }, [showAttendance]);

  // Fetch payroll data
  const fetchPayrollData = async () => {
    try {
      setPayrollLoading(true);
      setPayrollError(null);
      
      const response = await fetch('/api/staff-management/payroll-data');
      const data = await response.json();
      
      if (data.success) {
        setPayrollStaff(data.employees || []);
      } else {
        setPayrollStaff([]);
        setPayrollError(data.error || 'Failed to fetch payroll data');
      }
    } catch (error) {
      setPayrollStaff([]);
      setPayrollError('Failed to fetch payroll data');
    } finally {
      setPayrollLoading(false);
    }
  };

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      setAttendanceLoading(true);
      setAttendanceError(null);
      
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/staff-management/attendance-data?date=${today}`);
      const data = await response.json();
      
      if (data.success) {
        setAttendanceData(data.records || []);
      } else {
        setAttendanceData([]);
        setAttendanceError(data.error || 'Failed to fetch attendance data');
      }
    } catch (error) {
      setAttendanceData([]);
      setAttendanceError('Failed to fetch attendance data');
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Handle employee operations
  const handleEmployeeOperation = async (operation, data) => {
    try {
      const response = await fetch('/api/staff-management/employee-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operation, data }),
      });

      const result = await response.json();

      if (result.success) {
        setNotification({
          type: 'success',
          message: result.message
        });
        return { success: true, data: result };
      } else {
        setNotification({
          type: 'error',
          message: result.error
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to perform operation'
      });
      return { success: false, error: error.message };
    }
  };

  // Create employee
  const createEmployee = async (employeeData) => {
    return await handleEmployeeOperation('create', employeeData);
  };

  // Update employee
  const updateEmployee = async (employeeData) => {
    return await handleEmployeeOperation('update', employeeData);
  };

  // Delete employee
  const deleteEmployee = async (employeeId) => {
    return await handleEmployeeOperation('delete', { id: employeeId });
  };

  // Update employee status
  const updateEmployeeStatus = async (employeeId, status) => {
    return await handleEmployeeOperation('update_status', { id: employeeId, status });
  };

  // Send warning
  const sendWarning = async (employeeId, reason) => {
    return await handleEmployeeOperation('send_warning', { employeeId, reason });
  };

  // Revoke access
  const revokeAccess = async (employeeId, terminationLetter) => {
    return await handleEmployeeOperation('revoke_access', { employeeId, terminationLetter });
  };

  // Reinstate access
  const reinstateAccess = async (employeeId) => {
    return await handleEmployeeOperation('reinstate_access', { employeeId });
  };

  // Handle delete employee
  const handleDeleteEmployee = (emp) => {
    setEmployeeToDelete(emp);
    setShowDeleteModal(true);
  };

  // Confirm delete employee
  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    const result = await deleteEmployee(employeeToDelete.id || employeeToDelete.no);
    
    if (result.success) {
      setNotification({
        type: 'success',
        message: `Deleted ${employeeToDelete.name} successfully.`
      });
    }
    
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
  };

  // Cancel delete employee
  const cancelDeleteEmployee = () => {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
  };

  // Handle evidence modal
  const handleShowEvidence = (evidenceUrl) => {
    setEvidenceModalUrl(evidenceUrl);
    setShowEvidenceModal(true);
  };

  // Close evidence modal
  const closeEvidenceModal = () => {
    setShowEvidenceModal(false);
    setEvidenceModalUrl(null);
  };

  // Clear notification
  const clearNotification = () => {
    setNotification(null);
  };

  return {
    // State
    currentView,
    notification,
    showBlankPage,
    showAttendance,
    employeeToDelete,
    showDeleteModal,
    evidenceModalUrl,
    showEvidenceModal,
    payrollStaff,
    payrollLoading,
    payrollError,
    attendanceData,
    attendanceLoading,
    attendanceError,

    // Actions
    setCurrentView,
    setShowBlankPage,
    setShowAttendance,
    clearNotification,

    // Employee operations
    createEmployee,
    updateEmployee,
    deleteEmployee,
    updateEmployeeStatus,
    sendWarning,
    revokeAccess,
    reinstateAccess,

    // UI handlers
    handleDeleteEmployee,
    confirmDeleteEmployee,
    cancelDeleteEmployee,
    handleShowEvidence,
    closeEvidenceModal,

    // Data fetching
    fetchPayrollData,
    fetchAttendanceData
  };
} 