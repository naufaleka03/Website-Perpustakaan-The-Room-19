'use client';

import React, { useState } from 'react';
import { IoSearch } from "react-icons/io5";
import { IoCalendarOutline } from "react-icons/io5";
import { useAttendanceHistory } from '@/hooks/useAttendanceHistory';

const HistoryPage = () => {
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceModalUrl, setEvidenceModalUrl] = useState(null);

  // Use the custom hook for all business logic
  const {
    attendanceRecords,
    staff,
    loading,
    error,
    selectedRange,
    displayDateString,
    quickDateOptions,
    handleQuickDateSelect,
    getStaffName,
    getStaffDepartment,
    formatTimestamp,
    getStatusBadgeColor
  } = useAttendanceHistory();

  // Handle evidence modal
  const handleShowEvidence = (evidenceUrl) => {
    setEvidenceModalUrl(evidenceUrl);
    setShowEvidenceModal(true);
  };

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
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Attendance History</h2>
      
      {/* Quick Date Selection */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <IoCalendarOutline className="text-gray-600" size={20} />
          <span className="text-sm font-medium text-gray-700">Quick Date Selection:</span>
        </div>
        <div className="flex space-x-2">
          {quickDateOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleQuickDateSelect(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedRange === option.value
                  ? 'bg-sky-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {displayDateString && (
          <p className="mt-2 text-sm text-gray-600">
            Showing records for: <span className="font-medium">{displayDateString}</span>
          </p>
        )}
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
            <span className="ml-2 text-gray-600">Loading attendance records...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-8">
            <span className="text-red-500">{error}</span>
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
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 px-4 text-center text-gray-400">
                    No attendance records found for the selected period.
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record, idx) => {
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
                      <td className="py-3 px-4 font-medium">
                        {record.staff_name || getStaffName(record.staff_id)}
                      </td>
                      <td className="py-3 px-4">
                        {record.department || getStaffDepartment(record.staff_id)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(record.status)}`}>
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
                            onClick={() => handleShowEvidence(record.evidence_url)}
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
            <img 
              src={evidenceModalUrl} 
              alt="Evidence" 
              className="max-w-full max-h-96 rounded border mb-4" 
            />
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
  );
};

export default HistoryPage; 