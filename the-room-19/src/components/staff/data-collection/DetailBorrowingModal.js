import React from 'react';

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
  if (status === 'Returned') return 'returned';
  const today = new Date();
  const returnDateObj = new Date(returnDate);
  if (today > returnDateObj) return 'overdue';
  return 'ongoing';
};

export default function DetailBorrowingModal({ isOpen, onClose, borrowingData, onReturnBook }) {
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

        <div className="mt-6 flex justify-end gap-2 text-xs">
          {status !== 'returned' && (
            <button
              onClick={handleReturn}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
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
      </div>
    </div>
  );
}
