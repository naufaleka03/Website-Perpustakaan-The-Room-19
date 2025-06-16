'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PaymentFinishPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const status = searchParams.get('transaction_status');
  const paymentMethod = searchParams.get('payment_type');
  const loanId = searchParams.get('loan_id');
  const [loanSaved, setLoanSaved] = useState(false);
  const [loanError, setLoanError] = useState('');
  const [transactionSaved, setTransactionSaved] = useState(false);
  const [transactionError, setTransactionError] = useState('');
  const newReturnDate = typeof window !== 'undefined' ? localStorage.getItem('extendNewReturnDate') : null;

  useEffect(() => {
    // Proses simpan data loan jika ada data di localStorage dan payment sukses
    const loanDataStr = typeof window !== 'undefined' ? localStorage.getItem('loanBookData') : null;
    if (orderId && status && loanDataStr && !loanSaved) {
      const loanData = JSON.parse(loanDataStr);
      // Kirim ke /api/loans
      fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...loanData,
          payment_id: orderId,
          payment_status: status,
          payment_method: paymentMethod || null
        })
      })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setLoanSaved(true);
          localStorage.removeItem('loanBookData');
        } else {
          setLoanError(res.error || 'Gagal menyimpan data peminjaman');
        }
      })
      .catch(err => {
        setLoanError(err.message || 'Gagal menyimpan data peminjaman');
      });
    }

    // Jika extend/fine: insert ke tabel transaction
    if (loanId && orderId && status && paymentMethod && !transactionSaved) {
      // Ambil amount dari localStorage jika ada (untuk extend/fine)
      let amount = null;
      if (newReturnDate) {
        // Extend: ambil dari localStorage atau tentukan sendiri
        amount = localStorage.getItem('extendAmount');
      } else {
        // Fine: ambil dari localStorage atau tentukan sendiri
        amount = localStorage.getItem('fineAmount');
      }
      // Fallback jika tidak ada di localStorage
      if (!amount) amount = 0;
      fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loan_id: loanId,
          payment_id: orderId,
          payment_status: status,
          payment_method: paymentMethod,
          amount: amount
        })
      })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setTransactionSaved(true);
          // Setelah transaksi dicatat, update loan sesuai jenis transaksi
          if (loanId && newReturnDate) {
            // EXTEND: update loan_due ke tanggal extend, status ke 'On Going'
            fetch(`/api/loans/${loanId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ loan_due: newReturnDate, status: 'On Going' })
            })
            .then(res => res.json())
            .then(() => {
              localStorage.removeItem('extendNewReturnDate');
              localStorage.removeItem('extendAmount');
            });
          } else if (loanId && !newReturnDate) {
            // FINE: update loan_due ke hari ini, status ke 'Due Date', fine ke false
            const now = new Date();
            const wibOffset = 7 * 60;
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const wibNow = new Date(utc + (wibOffset * 60000));
            const todayWIB = wibNow.toISOString().split('T')[0];
            fetch(`/api/loans/${loanId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fine: false, payFine: true })
            })
            .then(res => res.json())
            .then(() => {
            localStorage.removeItem('fineAmount');
            });
          }
        } else {
          setTransactionError(res.error || 'Gagal menyimpan transaksi extend');
        }
      })
      .catch(err => setTransactionError(err.message || 'Gagal menyimpan transaksi extend'));
    }
  }, [loanId, orderId, status, paymentMethod, transactionSaved, newReturnDate]);

  // Helper function to get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'capture':
      case 'settlement':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ),
          message: 'Payment Successful!'
        };
      case 'pending':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: (
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          message: 'Payment Pending'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: (
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          message: 'Processing Payment'
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#5f5f2c]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-[#e5e5e5] font-['Poppins']">
        <div className="flex flex-col items-center text-center">
          {/* Status Icon */}
          <div className={`rounded-full ${statusInfo.bgColor} p-3 mb-3`}>
            {statusInfo.icon}
          </div>
          {/* Status Message */}
          <h2 className={`text-lg font-semibold ${statusInfo.color} mb-2 font-['Poppins']`}>{statusInfo.message}</h2>
          <p className="text-[#666] text-xs font-['Poppins'] mb-3">
            Reservasi Anda telah dikonfirmasi.<br />Status pembayaran: <span className="font-semibold capitalize">{status}</span>.
          </p>
          <div className="w-full flex flex-col gap-1 mb-4">
            <div className="flex justify-between text-xs text-[#888] font-['Poppins']">
              <span className="font-medium">Payment ID</span>
              <span>{orderId}</span>
            </div>
            <div className="flex justify-between text-xs text-[#888] font-['Poppins']">
              <span className="font-medium">Payment Status</span>
              <span className="capitalize">{status}</span>
            </div>
            <div className="flex justify-between text-xs text-[#888] font-['Poppins']">
              <span className="font-medium">Payment Method</span>
              <span>{paymentMethod || '-'}</span>
            </div>
          </div>
          <Link
            href="/user/dashboard/books/history?refresh=1"
            className="inline-block bg-[#2e3105] text-white text-xs font-['Poppins'] px-6 py-2 rounded-lg w-full hover:bg-[#3e4310] transition-colors font-medium shadow"
          >
            View My History
          </Link>
        </div>
      </div>
    </div>
  );
}
