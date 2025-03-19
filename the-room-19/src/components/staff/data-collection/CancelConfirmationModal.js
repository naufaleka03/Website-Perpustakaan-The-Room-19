import React from 'react';

export default function CancelConfirmationModal({ isOpen, onClose, onConfirm, selectedBookingId }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] relative">
        <h3 className="text-lg font-medium text-[#111010] font-['Poppins'] mb-2 text-center">Cancel Booking</h3>
        <hr className="w-full border-3/4 mx-auto border-[#666666] mb-4" />
        <p className="text-sm text-[#666666] font-['Poppins'] mb-6">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-['Poppins'] text-[#666666] border border-[#666666]/30 rounded-lg hover:bg-gray-50"
          >
            No, keep it
          </button>
          <button
            onClick={() => {
              onConfirm(selectedBookingId);
              onClose();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-red-700"
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
} 