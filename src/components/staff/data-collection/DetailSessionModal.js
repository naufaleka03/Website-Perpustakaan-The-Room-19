"use client";
import { useState, useEffect } from "react";
import { IoCalendarOutline } from "react-icons/io5";

export default function DetailSessionModal({ isOpen, onClose, sessionId }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId) return;
      try {
        const endpoint = `/api/sessions/${sessionId}`;
        const response = await fetch(endpoint);
        const responseData = await response.json();
        setData(responseData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [sessionId, isOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
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

        <h2 className="text-xl font-semibold text-[#111010] mb-6">
          Session Reservation Detail
        </h2>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <>
            {/* Full Name Field */}
            <div className="mb-4">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Full Name:
              </label>
              <p className="text-sm text-[#666666]">{data.full_name}</p>
            </div>

            {/* Category Field - Only for Sessions */}
            <div className="mb-4">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Category:
              </label>
              <p className="text-sm text-[#666666]">{data.category}</p>
            </div>

            {/* Arrival Date Field */}
            <div className="mb-4">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Arrival Date:
              </label>
              <p className="text-sm text-[#666666]">
                {formatDate(data.arrival_date)}
              </p>
            </div>

            {/* Shift Field */}
            <div className="mb-4">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Shift:
              </label>
              <p className="text-sm text-[#666666]">{data.shift_name}</p>
            </div>

            {/* Group Members Field - Optional */}
            {(data.group_member1 ||
              data.group_member2 ||
              data.group_member3 ||
              data.group_member4) && (
              <div className="mb-4">
                <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                  Group Members:
                </label>
                <div className="space-y-2">
                  {[
                    data.group_member1,
                    data.group_member2,
                    data.group_member3,
                    data.group_member4,
                  ]
                    .filter(Boolean)
                    .map((member, index) => (
                      <p key={index} className="text-sm text-[#666666]">
                        {member}
                      </p>
                    ))}
                </div>
              </div>
            )}

            {/* Status Field */}
            <div className="mb-4">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Status:
              </label>
              <p
                className={`text-sm ${
                  data.status === "canceled"
                    ? "text-red-800"
                    : data.status === "attended"
                    ? "text-green-800"
                    : "text-yellow-800"
                }`}
              >
                {data.status}
              </p>
            </div>

            {/* Cancellation Reason - Only show if status is canceled */}
            {data.status === "canceled" && data.cancellation_reason && (
              <div className="mb-4">
                <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                  Cancellation Reason:
                </label>
                <p className="text-sm text-red-800">
                  {data.cancellation_reason}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
