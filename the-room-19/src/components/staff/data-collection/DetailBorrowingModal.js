import React from 'react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

const getBorrowingStatus = (returnDate, status) => {
  if (status === 'returned') return 'returned';

  const today = new Date();
  const returnDateObj = new Date(returnDate);

  if (today > returnDateObj) {
    return 'overdue';
  }
  return 'ongoing';
};

export default function DetailBorrowingModal({ isOpen, onClose, borrowingData, onReturnBook }) {
  if (!isOpen || !borrowingData) return null;

  const status = getBorrowingStatus(borrowingData.return_date, borrowingData.status);

  const handleReturn = () => {
    if (onReturnBook) {
      onReturnBook(borrowingData.id);
    }
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

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

        <h2 className="text-xl font-semibold text-[#111010] mb-6">Borrowing Detail</h2>

        <div className="space-y-4">

          <div className="space-y-1">
            <label className="text-[#666666] text-sm font-medium font-['Poppins']">Full Name</label>
            <input
              type="text"
              value={borrowingData.name}
              readOnly
              className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666] bg-gray-100 font-['Poppins']"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#666666] text-sm font-medium font-['Poppins']">Book</label>
            <input
              type="text"
              value={borrowingData.book}
              readOnly
              className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666] bg-gray-100 font-['Poppins']"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#666666] text-sm font-medium font-['Poppins']">Email</label>
            <input
              type="text"
              value={borrowingData.email}
              readOnly
              className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666] bg-gray-100 font-['Poppins']"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#666666] text-sm font-medium font-['Poppins']">Phone Number</label>
            <input
              type="text"
              value={borrowingData.phone}
              readOnly
              className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666] bg-gray-100 font-['Poppins']"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#666666] text-sm font-medium font-['Poppins']">Borrowing Date</label>
            <input
              type="text"
              value={formatDate(borrowingData.borrowing_date)}
              readOnly
              className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666] bg-gray-100 font-['Poppins']"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#666666] text-sm font-medium font-['Poppins']">Return Date</label>
            <input
              type="text"
              value={formatDate(borrowingData.return_date)}
              readOnly
              className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666] bg-gray-100 font-['Poppins']"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#666666] text-sm font-medium font-['Poppins']">Status</label>
            <div>
              <span
                className={`inline-block px-2 py-1 rounded-lg text-xs font-['Poppins'] ${
                  status === 'returned'
                    ? 'text-green-800 bg-green-100'
                    : status === 'overdue'
                    ? 'text-red-800 bg-red-100'
                    : 'text-yellow-800 bg-yellow-100'
                }`}
              >
                {status === 'returned' ? 'Returned' : status === 'overdue' ? 'Over Due' : 'On Going'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {status !== 'returned' && (
            <button
              onClick={handleReturn}
              className="px-4 py-2 bg-[#111010] text-white rounded-xl text-sm font-['Poppins']"
            >
              Returned
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#666666]/30 rounded-xl text-sm text-[#666666] font-['Poppins']"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
