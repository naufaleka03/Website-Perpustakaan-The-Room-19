import React, { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import PaymentSummaryExtend from '@/components/payment/payment-summary-extend';
import PaymentSummaryFine from '@/components/payment/payment-summary-fine';

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

const getFineAmount = (returnDate, status) => {
  if (status === 'returned') return 0;
  const now = new Date();
  const wibOffset = 7 * 60;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibNow = new Date(utc + (wibOffset * 60000));
  let returnDateObj = null;
  if (typeof returnDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(returnDate)) {
    returnDateObj = new Date(returnDate + 'T00:00:00+07:00');
  } else {
    returnDateObj = new Date(returnDate);
  }
  const daysLate = Math.max(0, Math.floor((wibNow.setHours(0,0,0,0) - returnDateObj.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)));
  return daysLate * 5000;
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [extendData, setExtendData] = useState(null);
  const [showFineModal, setShowFineModal] = useState(false);
  const [finePaid, setFinePaid] = useState(false);
  const [loanData, setLoanData] = useState(borrowingData);

  // Cek status finePaid dari localStorage saat modal dibuka/loanId berubah
  useEffect(() => {
    if (isOpen && borrowingData && borrowingData.id) {
      const paid = typeof window !== 'undefined' ? localStorage.getItem('finePaid-' + borrowingData.id) : null;
      setFinePaid(paid === '1');
    }
  }, [isOpen, borrowingData && borrowingData.id]);

  useEffect(() => { setLoanData(borrowingData); }, [borrowingData]);

  const refetchLoan = async () => {
    if (!borrowingData?.id) return;
    const res = await fetch(`/api/loans?user_id=${borrowingData.user_id}`);
    const data = await res.json();
    if (res.ok && data.loans) {
      const updated = data.loans.find(l => l.id === borrowingData.id);
      if (updated) setLoanData(updated);
    }
  };

  if (!isOpen || !borrowingData) return null;

  if (!loanData) {
    return (
      <div className="flex-1 min-h-[calc(100vh-72px)] bg-white flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }
  const status = getBorrowingStatus(loanData.return_date, loanData.status);
  const isFined = loanData.fine === true;
  // Prioritaskan field fine dari database jika ada
  const fine = typeof loanData.fine !== 'undefined' ? loanData.fine : getFineAmount(loanData.return_date, loanData.status);
  const fineAmount = loanData.fine_amount || getFineAmount(loanData.return_date, loanData.status);

  // Hanya bisa extend jika fine === false
  const canExtend = (status === 'ongoing' || status === 'overdue') && !isFined;
  const mustPayFine = isFined;
  const showExtend = canExtend;

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

  const handleExtend = () => {
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
      const now = new Date();
      const wibOffset = 7 * 60;
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const wibNow = new Date(utc + (wibOffset * 60000));
      const daysLate = Math.max(0, Math.floor((wibNow.setHours(0,0,0,0) - returnDateObj.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)));
      chargeAmount = daysLate * 5000;
    }
    const newReturnDate = new Date(returnDateObj.getTime() + 7 * 24 * 60 * 60 * 1000);
    const newReturnDateStr = newReturnDate.toISOString().split('T')[0];
    setExtendData({
      bookTitle: borrowingData.books && borrowingData.books[0] ? borrowingData.books[0].title : '-',
      price: borrowingData.price,
      denda: chargeAmount,
      newReturnDate: newReturnDateStr,
      loanId: borrowingData.id
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('extendNewReturnDate', newReturnDateStr);
    }
    setShowPaymentModal(true);
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
                loanData.status === 'Returned'
                  ? 'bg-green-100 text-green-800'
                  : loanData.status === 'Over Due'
                  ? 'bg-red-100 text-red-800'
                  : loanData.status === 'Due Date'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {loanData.status}
              </span>
            }
          />
          {isFined && (
            <Row label="Denda" value={<span className="text-[#e53e3e] font-semibold">Rp {parseInt(fineAmount).toLocaleString('id-ID')}</span>} />
          )}
        </div>

        <div className="mt-4 text-xs font-['Poppins']">
          <h3 className="text-[#111010] font-semibold mb-2">📦 Book Borrowed</h3>
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

        <div className="mt-6 text-xs font-['Poppins']">
          {mustPayFine && (
            <div className="mb-2 text-red-500 font-semibold">
              Anda memiliki denda keterlambatan. Silakan bayar denda terlebih dahulu untuk dapat melakukan extend.
            </div>
          )}
          {showExtend && (
            <>
              {borrowingData.extend_count >= 3 && (
                <div className="mb-2 text-red-500 font-semibold">
                  Extension limit reached (maximum of 3 extensions allowed).
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleExtend}
                  className={`px-4 py-2 rounded-lg transition-colors text-white ${
                    borrowingData.extend_count >= 3
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#2e3105] hover:bg-[#3e4310]'
                  }`}
                  disabled={borrowingData.extend_count >= 3}
                >
                  Extend
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
          {mustPayFine && (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFineModal(true)}
                className="px-4 py-2 rounded-lg transition-colors text-white bg-[#e53e3e] hover:bg-[#b91c1c]"
              >
                Pay the Fine
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          )}
          {(status !== 'overdue' && status !== 'ongoing') && !mustPayFine && (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          )}
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
      {showPaymentModal && extendData && (
        <PaymentSummaryExtend
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          bookTitle={extendData.bookTitle}
          price={extendData.price}
          denda={extendData.denda}
          newReturnDate={extendData.newReturnDate}
          loanId={extendData.loanId}
        />
      )}
      {showFineModal && (
        <PaymentSummaryFine
          isOpen={showFineModal}
          onClose={() => setShowFineModal(false)}
          bookTitle={loanData.books && loanData.books[0] ? loanData.books[0].title : '-'}
          fine={fineAmount}
          loanId={loanData.id}
          onPaymentSuccess={() => {
            if (typeof window !== 'undefined') {
              localStorage.setItem('finePaid-' + loanData.id, '1');
            }
            setFinePaid(true);
            setShowFineModal(false);
          }}
          onLoanUpdated={refetchLoan}
        />
      )}
    </div>
  );
};

export default DetailBorrowingModal;
