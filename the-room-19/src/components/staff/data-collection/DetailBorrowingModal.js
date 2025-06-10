import React, { useState } from 'react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  let dateObj = null;
  if (typeof dateString === 'string' && dateString.trim() !== '') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      dateObj = new Date(dateString + 'T00:00:00+07:00');
    } else {
      dateObj = new Date(dateString);
    }
  } else if (typeof dateString === 'number') {
    dateObj = new Date(dateString);
  } else if (dateString instanceof Date) {
    dateObj = dateString;
  } else {
    return '';
  }
  if (!dateObj || isNaN(dateObj.getTime())) return '';
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
};

const getBorrowingStatus = (returnDate, status) => {
  if (status === 'Returned') return 'returned';
  // Gunakan waktu WIB
  const now = new Date();
  const wibOffset = 7 * 60; // menit
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibNow = new Date(utc + (wibOffset * 60000));
  let returnDateObj = null;
  if (typeof returnDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(returnDate)) {
    returnDateObj = new Date(returnDate + 'T00:00:00+07:00');
  } else {
    returnDateObj = new Date(returnDate);
  }
  // Status overdue jika hari setelah return date
  if (wibNow.setHours(0,0,0,0) > returnDateObj.setHours(0,0,0,0)) return 'overdue';
  return 'ongoing';
};

export default function DetailBorrowingModal({ isOpen, onClose, borrowingData, onReturnBook }) {
  const [showConfirm, setShowConfirm] = useState(false);
  if (!isOpen || !borrowingData) return null;

  const status = getBorrowingStatus(borrowingData.return_date, borrowingData.status);

  const handleReturn = async () => {
    try {
      console.log('Attempting to update loan status for ID:', borrowingData.id);
      
      // Panggil API untuk mengupdate status di database
      const response = await fetch(`/api/loans/${borrowingData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Returned',
          loan_id: borrowingData.id
        }),
      });

      // Periksa apakah respons adalah JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response from server');
      }

      // Log response untuk debugging
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        console.log('Successfully updated loan status');
        // Jika berhasil, panggil onReturnBook untuk update state di parent component
        if (onReturnBook) {
          onReturnBook(borrowingData.id);
          onClose(); // Tutup modal setelah berhasil
        }
      } else {
        console.error('Failed to update book status:', responseData.error || 'Unknown error');
        alert('Gagal memperbarui status buku. Silakan coba lagi.'); // Tampilkan pesan error ke user
      }
    } catch (error) {
      console.error('Error updating book status:', error);
      alert('Terjadi kesalahan saat memperbarui status buku. Silakan coba lagi.'); // Tampilkan pesan error ke user
    }
  };

  const handleReturnClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    handleReturn();
  };

  const handleConfirmCancel = () => {
    setShowConfirm(false);
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  const Row = ({ label, value }) => (
    <div className="flex justify-between text-xs py-1 border-b border-gray-100 font-['Poppins']">
      <div className="text-gray-500 font-medium w-1/3">{label}</div>
      <div className="text-gray-900 text-right w-2/3 break-words">{value}</div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto relative font-['Poppins'] text-sm">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        <h2 className="text-sm font-semibold text-[#111010] mb-4">📚 Borrowing Detail</h2>

        <div className="space-y-2 border-t border-b py-2 text-xs">
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

        <div className="mt-4 text-xs">
          <h3 className="text-[#111010] font-semibold mb-2">📦 Book Borrowed</h3>
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

        <div className="mt-6 flex justify-end gap-2 text-xs">
          {status !== 'returned' && (
            <button
              onClick={handleReturnClick}
              className="px-4 py-2 bg-[#2e3105] text-white rounded-lg hover:bg-[#3e4310] transition-colors"
            >
              Mark as Returned
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-40 font-[Poppins] text-xs">
            <div className="bg-white rounded-lg p-6 shadow-lg w-80 text-center">
              <div className="mb-4 text-gray-800">
                Are you sure you want to mark this loan as  <b>Returned</b>?
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={handleConfirmYes}
                  className="px-4 py-2 bg-[#2e3105] hover:bg-[#3e4310] text-white rounded-xl hover:opacity-90 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
