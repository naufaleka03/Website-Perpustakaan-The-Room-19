"use client";

import { useState, useRef, useEffect } from 'react';
import { useEmployeeData } from '@/hooks/owner/dashboard/employee/useEmployeeData';
import { useEmployeeModals } from '@/hooks/owner/dashboard/employee/useEmployeeModals';
import { useEmployeeForm } from '@/hooks/owner/dashboard/employee/useEmployeeForm';
import { handleWarning, handleRevokeAccess, handleReinstate } from '@/utils/owner/dashboard/employee/employeeUtils';
import EmployeeTable from '@/components/owner/dashboard/employee/EmployeeTable';
import EmployeeForm from '@/components/owner/dashboard/employee/EmployeeForm';
import { WarningModal, RevokeModal, DetailsModal } from '@/components/owner/dashboard/employee/EmployeeModals';

export default function Home() {
  const [currentView, setCurrentView] = useState('view_employees');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [notification, setNotification] = useState(null);
  const [showBlankPage, setShowBlankPage] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [evidenceModalUrl, setEvidenceModalUrl] = useState(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  // Fetch staff for Payroll page
  const [payrollStaff, setPayrollStaff] = useState([]);
  useEffect(() => {
    if (showBlankPage) {
      // Only fetch when Payroll page is shown
      fetch('/api/employees')
        .then(res => res.json())
        .then(data => {
          if (data && data.employees) {
            setPayrollStaff(data.employees);
          } else {
            setPayrollStaff([]);
          }
        })
        .catch(() => setPayrollStaff([]));
    }
  }, [showBlankPage]);

  // Fetch attendance data for Attendance page
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  
  useEffect(() => {
    if (showAttendance) {
      setAttendanceLoading(true);
      setAttendanceError(null);
      const fetchAttendance = async () => {
        try {
          // Fetch all records for today by default
          const today = new Date().toISOString().split('T')[0];
          const response = await fetch(`/api/staff/attendance/records?date=${today}`);
          if (!response.ok) throw new Error('Failed to fetch attendance records');
          const data = await response.json();
          setAttendanceData(data.records || []);
        } catch (err) {
          setAttendanceError(err.message || 'Failed to fetch attendance records');
          setAttendanceData([]);
        } finally {
          setAttendanceLoading(false);
        }
      };
      fetchAttendance();
    }
  }, [showAttendance]);

  // Filter attendance data based on selected time period
  const getFilteredAttendanceData = () => {
    if (selectedTimeFilter === 'all') {
      return attendanceData;
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    return attendanceData.filter(record => {
      const recordDate = new Date(record.date);
      
      switch (selectedTimeFilter) {
        case 'today':
          return record.date === todayString;
        case 'last7days':
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          return recordDate >= sevenDaysAgo && recordDate <= today;
        case 'lastmonth':
          const lastMonth = new Date(today);
          lastMonth.setMonth(today.getMonth() - 1);
          return recordDate >= lastMonth && recordDate <= today;
        default:
          return true;
      }
    });
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Custom hooks
  const {
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    allEmployees,
    employeesToDisplay,
    loading,
    error,
    addEmployee,
    updateEmployeeStatus,
    updateEmployee,
    refreshEmployees
  } = useEmployeeData();

  const {
    isRevokeModalOpen,
    employeeToRevoke,
    isDetailsModalOpen,
    employeeForDetails,
    isWarningModalOpen,
    employeeToWarn,
    warningReason,
    setWarningReason,
    terminationLetter,
    isEditMode,
    editFormData,
    editFormErrors,
    handleOpenRevokeModal,
    handleCloseRevokeModal,
    handleOpenWarningModal,
    handleCloseWarningModal,
    handleOpenDetailsModal,
    handleCloseDetailsModal,
    handleFileChange,
    handleStartEdit,
    handleCancelEdit,
    handleEditFormChange,
    validateEditForm
  } = useEmployeeModals();

  const {
    formData,
    formErrors,
    isSubmitting,
    handleFormChange,
    validateForm,
    createEmployee,
    resetForm
  } = useEmployeeForm();

  // Handle form submission
  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    
    const result = await createEmployee();
    
    if (result.success) {
      // Add the new employee to the local state
      addEmployee(result.employee);
      
      // Show success notification with temp password
      setNotification({
        type: 'success',
        message: `Employee created successfully! Temporary password: ${result.tempPassword}`,
        details: 'Please share this password with the employee for their first login.'
      });
      
      resetForm();
      setCurrentView('view_employees');
      
      // Refresh the employee list from the database
      await refreshEmployees();
    } else {
      setNotification({
        type: 'error',
        message: result.error
      });
    }
  };

  // Handle warning submission
  const handleSendWarning = () => {
    if (warningReason.trim()) {
      if (handleWarning(employeeToWarn, warningReason)) {
        handleCloseWarningModal();
      }
    } else {
      alert('Reason for warning cannot be empty.');
    }
  };

  // Handle revoke/reinstate
  const handleConfirmRevoke = () => {
    if (employeeToRevoke) {
      const newStatus = employeeToRevoke.status === 'Active' ? 'Non-Active' : 'Active';
      
      if (newStatus === 'Non-Active') {
        if (handleRevokeAccess(employeeToRevoke, terminationLetter)) {
          updateEmployeeStatus(employeeToRevoke.no, newStatus);
          handleCloseRevokeModal();
        }
      } else {
        if (handleReinstate(employeeToRevoke)) {
          updateEmployeeStatus(employeeToRevoke.no, newStatus);
          handleCloseRevokeModal();
        }
      }
    }
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (validateEditForm()) {
      // Update the employee data
      const updatedEmployee = {
        ...employeeForDetails,
        name: editFormData.fullName,
        gender: editFormData.gender,
        department: editFormData.department,
        shift: editFormData.shift,
        email: editFormData.email,
        phone: editFormData.phone,
        address: editFormData.address,
        age: parseInt(editFormData.age),
      };
      
      // Update the employee using the hook function
      updateEmployee(updatedEmployee);
      
      // Update the employee for details to show the updated data
      handleOpenDetailsModal(updatedEmployee);
      
      // Close edit mode
      handleCancelEdit();
    }
  };

  // Handle delete employee (open modal)
  const handleDeleteEmployee = (emp) => {
    setEmployeeToDelete(emp);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    const employeeId = employeeToDelete.id || employeeToDelete.no;
    try {
      const res = await fetch(`/api/employees?id=${employeeId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete employee');
      setNotification({ type: 'success', message: `Deleted ${employeeToDelete.name} successfully.` });
      await refreshEmployees();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to delete employee.' });
    } finally {
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    }
  };

  // Cancel delete
  const cancelDeleteEmployee = () => {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full min-h-[calc(100vh-12rem)]">
      {/* Page Switch Button */}
      <div className="mb-4 flex gap-2">
        <button
          className={`px-4 py-2 rounded-md font-medium ${!showBlankPage && !showAttendance ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => {
            setShowBlankPage(false);
            setShowAttendance(false);
          }}
        >
          Employee Page
        </button>
        <button
          className={`px-4 py-2 rounded-md font-medium ${showBlankPage && !showAttendance ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => {
            setShowBlankPage(true);
            setShowAttendance(false);
          }}
        >
          Payroll
        </button>
        <button
          className={`px-4 py-2 rounded-md font-medium ${showAttendance ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => {
            setShowBlankPage(false);
            setShowAttendance(true);
          }}
        >
          Attendance
        </button>
      </div>

      {/* Render Payroll Page, Attendance Page, or Employee Page */}
      {showBlankPage ? (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payroll</h2>
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Name</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Working Hours</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {payrollStaff.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 px-4 text-center text-gray-400">No staff found.</td>
                </tr>
              ) : (
                payrollStaff.map((staff, idx) => (
                  <tr key={staff.id || idx} className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-4">{staff.name}</td>
                    <td className="py-3 px-4">{staff.working_hours || '-'}</td>
                    <td className="py-3 px-4">{staff.payment_date || new Date().toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : showAttendance ? (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Attendance History</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {attendanceLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                <span className="ml-2 text-gray-600">Loading attendance records...</span>
              </div>
            ) : attendanceError ? (
              <div className="flex justify-center items-center py-8">
                <span className="text-red-500">{attendanceError}</span>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Staff</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Department</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Status</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Date & Time</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 px-4 text-center text-gray-400">No attendance records found.</td>
                    </tr>
                  ) : (
                    attendanceData.map((record, idx) => {
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
                        <tr key={`${record.staff_id}-${record.timestamp}-${idx}`} className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-3 px-4 font-medium">{record.staff_name || 'Unknown'}</td>
                          <td className="py-3 px-4">{record.department || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.status === 'P' 
                                ? 'bg-green-100 text-green-800' 
                                : record.status === 'L' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : record.status === 'A' 
                                ? 'bg-red-100 text-red-800' 
                                : record.status === 'CO'
                                ? 'bg-blue-100 text-blue-800'
                                : record.status === 'ECO'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {record.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>{dateStr}</div>
                            <div className="text-xs text-gray-500 font-mono">{timeStr}</div>
                          </td>
                          <td className="py-3 px-4">
                            {record.evidence_url ? (
                              <button
                                className="px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-600 text-xs font-medium"
                                onClick={() => { setEvidenceModalUrl(record.evidence_url); setShowEvidenceModal(true); }}
                              >
                                See Evidence
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs">No Evidence</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
          {/* Evidence Modal */}
          {showEvidenceModal && evidenceModalUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full flex flex-col items-center">
                <h2 className="text-lg font-semibold mb-4">Evidence</h2>
                <img src={evidenceModalUrl} alt="Evidence" className="max-w-full max-h-96 rounded border mb-4" />
                <button
                  onClick={() => setShowEvidenceModal(false)}
                  className="px-4 py-2 rounded bg-sky-500 text-white hover:bg-sky-600"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Notification */}
          {notification && (
            <div className={`mb-4 p-4 rounded-lg ${
              notification.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{notification.message}</p>
                  {notification.details && (
                    <p className="text-sm mt-1 opacity-90">{notification.details}</p>
                  )}
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <h2 className="text-lg font-semibold mb-4 text-red-600">Delete Employee</h2>
                <p className="mb-4">Are you sure you want to delete <span className="font-bold">{employeeToDelete?.name}</span>? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelDeleteEmployee}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteEmployee}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentView === 'view_employees' ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Employees</h2>
              <hr className="border-gray-300" />

              <div className="mt-6 flex items-center space-x-4 mb-6">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200"
                />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 bg-white text-gray-700 font-medium cursor-pointer hover:border-gray-400"
                >
                  <option value="" className="text-gray-500">All Status</option>
                  <option value="Active" className="text-gray-700 font-medium">Active</option>
                  <option value="Non-Active" className="text-gray-700 font-medium">Non-Active</option>
                </select>
                <button
                  onClick={() => setCurrentView('add_employee_form')}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 transition-colors duration-200 font-medium"
                >
                  Add Employee
                </button>
              </div>

              <div className="flex-1 transition-all duration-300 ease-in-out">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                    <span className="ml-2 text-gray-600">Loading employees...</span>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-center">
                      <p className="text-red-500 mb-2">{error}</p>
                      <button
                        onClick={refreshEmployees}
                        className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : (
                  <EmployeeTable
                    employees={employeesToDisplay}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    dropdownRef={dropdownRef}
                    onOpenWarningModal={handleOpenWarningModal}
                    onOpenDetailsModal={handleOpenDetailsModal}
                    onOpenRevokeModal={handleOpenRevokeModal}
                    onDeleteEmployee={handleDeleteEmployee}
                  />
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Employee</h2>
              <hr className="border-gray-300" />
              <EmployeeForm
                formData={formData}
                formErrors={formErrors}
                handleFormChange={handleFormChange}
                handleSaveEmployee={handleSaveEmployee}
                onCancel={() => setCurrentView('view_employees')}
                isSubmitting={isSubmitting}
              />
            </>
          )}

          {/* Modals */}
          <WarningModal
            isOpen={isWarningModalOpen}
            employee={employeeToWarn}
            warningReason={warningReason}
            setWarningReason={setWarningReason}
            onClose={handleCloseWarningModal}
            onSend={handleSendWarning}
          />

          <RevokeModal
            isOpen={isRevokeModalOpen}
            employee={employeeToRevoke}
            terminationLetter={terminationLetter}
            onFileChange={handleFileChange}
            onClose={handleCloseRevokeModal}
            onConfirm={handleConfirmRevoke}
          />

          <DetailsModal
            isOpen={isDetailsModalOpen}
            employee={employeeForDetails}
            onClose={handleCloseDetailsModal}
            isEditMode={isEditMode}
            editFormData={editFormData}
            editFormErrors={editFormErrors}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onEditFormChange={handleEditFormChange}
            onSaveEdit={handleSaveEdit}
          />
        </>
      )}
    </div>
  );
} 