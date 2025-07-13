import React, { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import PaymentSummaryExtend from '@/components/payment/payment-summary-extend';
import PaymentSummaryFine from '@/components/payment/payment-summary-fine';
import { createClient } from '@/app/supabase/client';

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
  const [showExtendOption, setShowExtendOption] = useState(false);
  const [extendOptions, setExtendOptions] = useState([
    { label: '1 Minggu', value: 1, disabled: false },
    { label: '2 Minggu', value: 2, disabled: false },
    { label: '3 Minggu', value: 3, disabled: false },
  ]);

  // Cek status finePaid dari localStorage saat modal dibuka/loanId berubah
  useEffect(() => {
    if (isOpen && borrowingData && borrowingData.id) {
      const paid = typeof window !== 'undefined' ? localStorage.getItem('finePaid-' + borrowingData.id) : null;
      setFinePaid(paid === '1');
    }
  }, [isOpen, borrowingData && borrowingData.id]);

  useEffect(() => { setLoanData(borrowingData); }, [borrowingData]);

  // Helper untuk ambil tanggal pengembalian dengan fallback
  const getLoanDue = () => {
    if (loanData && loanData.loan_due) return loanData.loan_due;
    if (loanData && loanData.return_date) return loanData.return_date;
    if (borrowingData && borrowingData.loan_due) return borrowingData.loan_due;
    if (borrowingData && borrowingData.return_date) return borrowingData.return_date;
    return null;
  };

  // Validasi opsi extend berdasarkan max_due
  useEffect(() => {
    if (!loanData) return;
    const loan_due = getLoanDue();
    const { max_due } = loanData;
    let returnDateObj = null;
    if (typeof loan_due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(loan_due)) {
      returnDateObj = new Date(loan_due + 'T00:00:00+07:00');
    } else {
      returnDateObj = new Date(loan_due);
    }
    let maxDueObj = null;
    if (typeof max_due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(max_due)) {
      maxDueObj = new Date(max_due + 'T00:00:00+07:00');
    } else {
      maxDueObj = new Date(max_due);
    }
    // Hanya tampilkan opsi yang valid (tidak melebihi max_due)
    const validOptions = [1,2,3].filter(week => {
      const newReturn = new Date(returnDateObj.getTime() + week * 7 * 24 * 60 * 60 * 1000);
      return newReturn <= maxDueObj;
    });
    setExtendOptions(validOptions.map(week => ({
      label: `${week} Minggu`,
      value: week
    })));
  }, [loanData]);

  const refetchLoan = async () => {
    if (!borrowingData?.id || !borrowingData?.user_id) return;
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !user.id) {
        console.error('User not authenticated or user ID undefined');
        return;
      }

      console.log('Refetching loan data for ID:', borrowingData.id);
      const res = await fetch(`/api/loans?user_id=${user.id}`);
      const data = await res.json();
      if (res.ok && data.loans) {
        const updated = data.loans.find(l => l.id === borrowingData.id);
        if (updated) {
          console.log('Updated loan data:', updated);
          setLoanData(updated);
        } else {
          console.log('Loan not found in updated data');
        }
      }
    } catch (error) {
      console.error('Error refetching loan:', error);
    }
  };

  // Tambahkan efek untuk listen perubahan extend dari PaymentFinishPage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handler = () => {
      // Jika ada flag extendSuccess di localStorage, refetch data
      if (localStorage.getItem('extendSuccess') === '1') {
        console.log('extendSuccess flag detected, refetching loan data');
        refetchLoan();
        localStorage.removeItem('extendSuccess');
      }
    };
    
    // Listen untuk custom event loanUpdated
    const loanUpdatedHandler = (event) => {
      console.log('loanUpdated event received:', event.detail);
      if (event.detail && event.detail.loanId === borrowingData?.id) {
        console.log('Matching loan ID, refetching data immediately');
        refetchLoan();
      }
    };
    
    window.addEventListener('storage', handler);
    window.addEventListener('loanUpdated', loanUpdatedHandler);
    
    // Cek juga saat mount
    handler();
    
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('loanUpdated', loanUpdatedHandler);
    };
  }, [loanData, borrowingData?.id]);

  // Tambahkan polling untuk refetch data saat modal terbuka
  useEffect(() => {
    if (!isOpen || !borrowingData?.id) return;
    
    // Refetch data setiap 1 detik saat modal terbuka (lebih cepat)
    const interval = setInterval(() => {
      refetchLoan();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isOpen, borrowingData?.id]);

  if (!isOpen || !borrowingData) return null;

  if (!loanData) {
    return (
      <div className="flex-1 min-h-[calc(100vh-72px)] bg-white flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }
  const status = getBorrowingStatus(getLoanDue(), loanData.status);
  const isFined = loanData.fine === true;
  // Prioritaskan field fine dari database jika ada
  const fine = typeof loanData.fine !== 'undefined' ? loanData.fine : getFineAmount(getLoanDue(), loanData.status);
  const fineAmount = loanData.fine_amount || getFineAmount(getLoanDue(), loanData.status);

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

  // Pilih durasi extend
  const handleExtend = () => {
    setShowExtendOption(true);
  };

  // Proses extend setelah pilih durasi
  const handleSelectExtend = (week) => {
    let returnDateObj = null;
    const loan_due = getLoanDue();
    if (typeof loan_due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(loan_due)) {
      returnDateObj = new Date(loan_due + 'T00:00:00+07:00');
    } else {
      returnDateObj = new Date(loan_due);
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
    const newReturnDate = new Date(returnDateObj.getTime() + week * 7 * 24 * 60 * 60 * 1000);
    const newReturnDateStr = newReturnDate.toISOString().split('T')[0];
    setExtendData({
      bookTitle: loanData.books && loanData.books[0] ? loanData.books[0].title : '-',
      price: parseInt(loanData.price) * week,
      denda: chargeAmount,
      newReturnDate: newReturnDateStr,
      loanId: loanData.id
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('extendNewReturnDate', newReturnDateStr);
    }
    setShowExtendOption(false);
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
          <Row label="Borrowing Date" value={formatDate(loanData.borrowing_date)} />
          <Row label="Return Date" value={formatDate(getLoanDue())} />
          <Row label="Total Price" value={typeof loanData.price === 'number' ? `Rp${loanData.price.toLocaleString('id-ID')}` : (parseInt(loanData.price) ? `Rp${parseInt(loanData.price).toLocaleString('id-ID')}` : loanData.price)} />
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
          {isFined && fineAmount > 0 && (
            <Row label="Denda" value={<span className="text-[#e53e3e] font-semibold">Rp {parseInt(fineAmount).toLocaleString('id-ID')}</span>} />
          )}
        </div>

        <div className="mt-4 text-xs font-['Poppins']">
          <h3 className="text-[#111010] font-semibold mb-2">📦 Book Borrowed</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {borrowingData.books && borrowingData.books.map((book, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg p-2 min-h-[72px] min-w-[120px]" style={{minHeight:'72px', minWidth:'120px'}}>
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-12 h-16 rounded object-cover border flex-shrink-0"
                    style={{width:'48px',height:'64px'}}
                  />
                ) : (
                  <div className="w-12 h-16 rounded bg-[#eff0c3] flex items-center justify-center text-[#52570d] font-bold text-base flex-shrink-0" style={{width:'48px',height:'64px'}}>
                    {book.title.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="text-gray-800 font-medium line-clamp-2 text-xs sm:text-sm break-words" style={{wordBreak:'break-word'}}>{book.title}</span>
                  {typeof borrowingData.copies !== 'undefined' && (
                    <div className="text-[10px] text-gray-500 mt-1">Copy: {borrowingData.copies}</div>
                  )}
                </div>
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
              {extendOptions.length === 0 && (
                <div className="mb-2 text-red-500 font-semibold">Anda tidak dapat melakukan perpanjangan lagi karena sudah melewati batas maksimal perpanjangan.</div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleExtend}
                  className={`px-4 py-2 rounded-lg transition-colors text-white bg-[#2e3105] hover:bg-[#3e4310] ${extendOptions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={extendOptions.length === 0}
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
              {/* Modal Pilihan Durasi Extend */}
              {showExtendOption && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={()=>setShowExtendOption(false)}>
                  <div className="bg-white rounded-xl p-6 w-[350px] max-w-full text-center shadow-lg relative" onClick={e=>e.stopPropagation()}>
                    <h3 className="text-black text-sm font-semibold mb-4">Pilih Durasi Perpanjangan</h3>
                    <div className="flex flex-col gap-3 mb-4">
                      {extendOptions.length === 0 && (
                        <div className="text-red-500 text-xs">Tidak ada opsi perpanjangan yang tersedia (melebihi max due).</div>
                      )}
                      {extendOptions.map(opt => (
                        <button
                          key={opt.value}
                          className="w-full px-4 py-2 rounded-lg text-xs font-medium bg-[#2e3105] text-white hover:bg-[#3e4310]"
                          onClick={()=>handleSelectExtend(opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <button className="mt-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-xs" onClick={()=>setShowExtendOption(false)}>Batal</button>
                  </div>
                </div>
              )}
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
          onClose={async () => {
            setShowPaymentModal(false);
            // Setelah modal pembayaran ditutup, refetch data pinjaman agar loan_due terupdate
            await refetchLoan();
          }}
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
          onPaymentSuccess={async () => {
            if (typeof window !== 'undefined') {
              localStorage.setItem('finePaid-' + loanData.id, '1');
            }
            setFinePaid(true);
            setShowFineModal(false);
            // Refetch loan untuk update status, fine, dan return_date
            await refetchLoan();
          }}
          onLoanUpdated={refetchLoan}
        />
      )}
    </div>
  );
};

export default DetailBorrowingModal;
