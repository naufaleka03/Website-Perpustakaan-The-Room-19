import React from "react";

const RetireConfirmationModal = ({ isOpen, onClose, onRetire, book }) => {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-[450px] max-w-sm">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Retire Book</h2>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          Are you sure you want to mark this book as damaged and remove it from
          the inventory? <br />
          <span className="block mt-2 text-xs text-gray-500">
            (Any changes will mark this book as a transaction out in the system)
          </span>
        </p>
        <div className="flex justify-between gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onRetire}
            className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition duration-200"
          >
            Retire Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetireConfirmationModal;
