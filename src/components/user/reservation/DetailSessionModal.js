import React from "react";
import { IoMdClose } from "react-icons/io";

const Row = ({ label, value }) => (
  <div className="flex justify-between text-xs py-2 border-b border-gray-100 font-['Poppins']">
    <div className="text-gray-500 font-medium w-1/3">{label}</div>
    <div className="text-gray-900 text-right w-2/3 break-words">{value}</div>
  </div>
);

export default function DetailSessionModal({ isOpen, onClose, session }) {
  if (!isOpen || !session) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const startTime = session.shift_start.substring(0, 5);
  const endTime = session.shift_end.substring(0, 5);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative font-['Poppins'] text-xs sm:text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          <IoMdClose />
        </button>

        <h2 className="text-sm font-semibold text-[#111010] mb-4 font-['Poppins']">
          🗓️ Session Details
        </h2>
        <div className="space-y-1 border-t border-b py-2 text-xs font-['Poppins']">
          <Row label="Arrival Date" value={formatDate(session.arrival_date)} />
          <Row label="Booking Date" value={formatDate(session.created_at)} />
          <Row label="Full Name" value={session.full_name} />
          <Row label="Category" value={session.category} />
          <Row label="Shift" value={session.shift_name} />
          <Row label="Time" value={`${startTime} - ${endTime}`} />
        </div>

        {session.group_members && session.group_members.length > 0 && (
          <div className="mt-4 text-xs font-['Poppins']">
            <h3 className="text-[#111010] font-semibold mb-2">
              👥 Group Members
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {session.group_members.map((member, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-100 rounded-lg p-2"
                >
                  <span className="text-gray-800 font-medium">{member}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
