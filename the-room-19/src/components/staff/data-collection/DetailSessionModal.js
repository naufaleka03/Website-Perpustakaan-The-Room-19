"use client"
import { useState, useEffect } from 'react';
import { IoCalendarOutline } from "react-icons/io5";

export default function DetailSessionModal({ isOpen, onClose, sessionId }) {
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) return;
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        const data = await response.json();
        setSessionData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching session data:', error);
      }
    };

    if (isOpen) {
      fetchSessionData();
    }
  }, [sessionId, isOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-xl p-6 w-[750px] max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-[#111010] mb-6">Session Reservation Detail</h2>
        
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* Full Name Field */}
            <div className="space-y-1 mb-4">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Full Name
              </label>
              <input
                type="text"
                value={sessionData.full_name}
                readOnly
                className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100"
              />
            </div>

            {/* Category Field */}
            <div className="space-y-1 mb-4">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Category
              </label>
              <input
                value={sessionData.category}
                readOnly
                className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100"
              />
            </div>

            {/* Arrival Date Field */}
            <div className="space-y-1 mb-4">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Arrival Date
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={sessionData.arrival_date ? formatDate(sessionData.arrival_date) : ''}
                  readOnly
                  className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100"
                />
              </div>
            </div>

            {/* Shift Field */}
            <div className="space-y-1 mb-4">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Shift
              </label>
              <input
                value={sessionData.shift_name}
                readOnly
                className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100"
              />
            </div>

            {/* Group Members Field - Optional */}
            {sessionData.group_member1 && (
              <div className="space-y-1 mb-4">
                <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                  Group Members
                </label>
                <div className="space-y-2">
                  {[
                    sessionData.group_member1,
                    sessionData.group_member2,
                    sessionData.group_member3,
                    sessionData.group_member4
                  ].filter(Boolean).map((member, index) => (
                    <input
                      key={index}
                      type="text"
                      value={member}
                      readOnly
                      className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 