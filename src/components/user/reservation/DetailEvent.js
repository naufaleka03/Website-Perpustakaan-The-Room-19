import React from "react";

export default function DetailEvent({ event, isOpen, onClose, onRegister }) {
  if (!isOpen || !event) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] relative">
        <h2 className="text-xl font-semibold text-[#111010] mb-2 text-center">
          {event.event_name}
        </h2>
        <p className="text-sm text-[#666666] mb-4 text-left leading-relaxed break-words">
          {event.description}
        </p>
        {event.additional_notes && (
          <div className="mb-4">
            <p className="text-sm text-[#666666] font-semibold mb-1">
              Additional Notes:
            </p>
            <p className="text-sm text-[#444] whitespace-pre-line">
              {event.additional_notes}
            </p>
          </div>
        )}
        <div className="mb-4">
          <p className="text-sm text-[#666666] font-medium">
            Available Slots:{" "}
            {event.max_participants - (event.current_participants || 0)} of{" "}
            {event.max_participants}
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-['Poppins'] text-[#666666] border border-[#666666]/30 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={onRegister}
            disabled={event.status === "closed"}
            className={`px-4 py-2 rounded-lg text-xs ${
              event.status === "closed"
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#111010] text-white hover:bg-[#222]"
            }`}
          >
            {event.status === "closed" ? "Registration Closed" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
