import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  let dateObj = null;
  if (typeof dateString === 'string' && dateString.trim() !== '') {
    // Jika string hanya YYYY-MM-DD, tambahkan waktu dan offset WIB
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
    return '-';
  }
  if (!dateObj || isNaN(dateObj.getTime())) return '-';
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

const Row = ({ label, value }) => (
  <div className="flex justify-between text-xs py-1 border-b border-gray-100 font-['Poppins']">
    <div className="text-gray-500 font-medium w-1/3">{label}</div>
    <div className="text-gray-900 text-right w-2/3 break-words">{value}</div>
  </div>
);

const DetailBorrowingModal = ({ isOpen, onClose, borrowingData, onReturnBook }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [charge, setCharge] = useState(0);
  if (!isOpen || !borrowingData) return null;

  // Gunakan fungsi getBorrowingStatus yang sudah benar
  const status = getBorrowingStatus(borrowingData.return_date, borrowingData.status);

  const showExtend = status === 'ongoing' || status === 'overdue';

  const handleReturn = async () => {
    try {
      const response = await fetch(`/api/loans/${borrowingData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Returned', loan_id: borrowingData.id }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response from server');
      }

      const data = await response.json();
      if (response.ok) {
        if (onReturnBook) {
          onReturnBook(borrowingData.id);
          onClose();
        }
      } else {
        alert('Gagal memperbarui status buku.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Terjadi kesalahan saat memperbarui status.');
    }
  };

  const handleExtend = async () => {
    try {
      // Hitung tanggal baru (WIB)
      let returnDateObj = null;
      if (typeof borrowingData.return_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(borrowingData.return_date)) {
        returnDateObj = new Date(borrowingData.return_date + 'T00:00:00+07:00');
      } else {
        returnDateObj = new Date(borrowingData.return_date);
      }
      // Hitung charge jika overdue
      let chargeAmount = 0;
      if (status === 'overdue') {
        // Hitung selisih hari antara hari ini (WIB) dan return date
        const now = new Date();
        const wibOffset = 7 * 60;
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const wibNow = new Date(utc + (wibOffset * 60000));
        const daysLate = Math.max(0, Math.floor((wibNow.setHours(0,0,0,0) - returnDateObj.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)));
        chargeAmount = daysLate * 5000;
        setCharge(chargeAmount);
      } else {
        setCharge(0);
      }
      const newReturnDate = new Date(returnDateObj.getTime() + 7 * 24 * 60 * 60 * 1000);
      // Format YYYY-MM-DD
      const newReturnDateStr = newReturnDate.toISOString().split('T')[0];
      const response = await fetch(`/api/loans/${borrowingData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loan_due: newReturnDateStr }),
      });
      if (!response.ok) throw new Error('Gagal extend tanggal');
      const data = await response.json();
      if (onReturnBook) {
        onReturnBook(borrowingData.id); // trigger refresh parent
      }
      // Update tampilan modal (local)
      borrowingData.return_date = newReturnDateStr;
      borrowingData.status = 'On Going';
      // Tampilkan notifikasi sukses/charge
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (typeof window !== 'undefined') {
          window.location.href = '/user/dashboard/books/history';
        }
      }, 2000);
    } catch (error) {
      alert('Gagal memperpanjang masa pinjam.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto relative font-['Poppins'] text-xs sm:text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          <IoMdClose />
        </button>

        <h2 className="text-sm font-semibold text-[#111010] mb-4 font-['Poppins']">📚 Borrowing Detail</h2>
        <div className="space-y-2 border-t border-b py-2 text-xs font-['Poppins']">
          <Row label="Borrowing Date" value={formatDate(borrowingData.borrowing_date)} />
          <Row label="Return Date" value={formatDate(borrowingData.return_date)} />
          <Row label="Total Price" value={borrowingData.price}/>
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

        <div className="mt-4 text-xs font-['Poppins']">
          <h3 className="text-[#111010] font-semibold mb-2">📦 Book(s) Borrowed</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {borrowingData.books && borrowingData.books.map((book, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg p-2">
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-12 h-16 rounded object-cover border"
                  />
                ) : (
                  <div className="w-12 h-16 rounded bg-[#eff0c3] flex items-center justify-center text-[#52570d] font-bold text-base">
                    {book.title.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
                  </div>
                )}
                <span className="text-gray-800 font-medium line-clamp-2 text-xs sm:text-sm">{book.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 text-xs font-['Poppins']">
          {(status === 'overdue' || status === 'ongoing') && (
            <button
              onClick={handleExtend}
              className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Extend
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
      {/* Notifikasi pop up sukses/charge */}
      {showSuccess && (() => {
        // Pastikan price dan charge bertipe number
        let price = borrowingData.price;
        if (typeof price === 'string') price = parseFloat(price.replace(/[^\d.-]/g, '')) || 0;
        const total = price + (charge || 0);
        return (
          <div className="fixed left-1/2 bottom-8 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-semibold animate-fade-in">
            {charge > 0
              ? `Perpanjangan Berhasil. Denda keterlambatan: Rp${charge.toLocaleString('id-ID')}. Total pembayaran: Rp${total.toLocaleString('id-ID')}`
              : `Perpanjangan Berhasil. Total pembayaran: Rp${total.toLocaleString('id-ID')}`}
          </div>
        );
      })()}
    </div>
  );
};

export default DetailBorrowingModal;
