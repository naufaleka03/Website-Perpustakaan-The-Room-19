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
  if (today > returnDateObj) return 'overdue';
  return 'ongoing';
};

export default function DetailBorrowingModal({ isOpen, onClose, borrowingData, onReturnBook }) {
  if (!isOpen || !borrowingData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getBorrowingStatus = (returnDate, status) => {
    if (status === 'returned') return 'returned';
    const today = new Date();
    const returnDateObj = new Date(returnDate);
    if (today > returnDateObj) return 'overdue';
    return 'ongoing';
  };

  const status = getBorrowingStatus(borrowingData.return_date, borrowingData.status);

  const handleReturn = () => {
    if (onReturnBook) onReturnBook(borrowingData.id);
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  const Row = ({ label, value }) => (
    <div className="flex justify-between text-sm py-1 border-b border-gray-100">
      <div className="text-gray-500 font-medium w-1/3">{label}</div>
      <div className="text-gray-900 text-right w-2/3 break-words">{value}</div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto relative font-['Poppins']">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        <h2 className="text-base font-semibold text-[#111010] mb-4">📚 Borrowing Detail</h2>

        {/* Ringkasan */}
        <div className="space-y-2 border-t border-b py-2 text-sm">
          <Row label="Name" value={borrowingData.name} />
          <Row label="Email" value={borrowingData.email} />
          <Row label="Phone" value={borrowingData.phone} />
          <Row label="Borrowing Date" value={formatDate(borrowingData.borrowing_date)} />
          <Row label="Return Date" value={formatDate(borrowingData.return_date)} />
          <Row
            label="Status"
            value={
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                status === 'returned'
                  ? 'bg-green-100 text-green-800'
                  : status === 'overdue'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status === 'returned' ? 'Returned' : status === 'overdue' ? 'Over Due' : 'On Going'}
              </span>
            }
          />
        </div>

        {/* Buku */}
        <div className="mt-4 text-sm">
          <h3 className="text-[#111010] font-semibold mb-2">📦 Book(s) Borrowed</h3>
          <div className="space-y-2 border border-gray-100 p-3 rounded-lg bg-gray-50">
            <div className="flex justify-between">
              <span className="text-gray-700">{borrowingData.book1}</span>
              <span className="text-gray-500">1x</span>
            </div>
            {borrowingData.book2 && (
              <div className="flex justify-between">
                <span className="text-gray-700">{borrowingData.book2}</span>
                <span className="text-gray-500">1x</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-2">
          {status !== 'returned' && (
            <button
              onClick={handleReturn}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm"
            >
              Mark as Returned
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


