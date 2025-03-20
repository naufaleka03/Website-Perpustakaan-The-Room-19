"use client";
import { useEffect, useRef } from 'react';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, eventName }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-xl p-6 w-[400px] relative">
        <h3 className="text-lg font-medium text-[#111010] font-['Poppins'] mb-2 text-center">Confirm Deletion</h3>
        <hr className="w-full border-3/4 mx-auto border-[#666666] mb-4" />
        <p className="text-sm text-[#666666] font-['Poppins'] mb-6">
          Are you sure you want to delete event "{eventName}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-800 text-xs rounded-lg border border-[#666666]/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}