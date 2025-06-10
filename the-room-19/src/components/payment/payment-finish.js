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

    // Jika extend: insert ke tabel transaction
    if (loanId && orderId && status && paymentMethod && !transactionSaved) {
      fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loan_id: loanId,
          payment_id: orderId,
          payment_status: status,
          payment_method: paymentMethod
        })
      })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setTransactionSaved(true);
          // Setelah transaksi extend dicatat, update return date dan status pada loans LANGSUNG di sini
          if (loanId && newReturnDate) {
            fetch(`/api/loans/${loanId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ loan_due: newReturnDate, status: 'On Going' })
            })
            .then(res => res.json())
            .then(() => {
              localStorage.removeItem('extendNewReturnDate');
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
    <div className="p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-4">
            <div className={`rounded-full ${statusInfo.bgColor} p-3`}>
              {statusInfo.icon}
            </div>
          </div>

          {/* Status Message */}
          <h2 className={`text-2xl font-bold ${statusInfo.color} mb-4`}>
            {statusInfo.message}
          </h2>
          
          <p className="text-gray-600 mb-4">
            Your reservation has been confirmed and payment status is{' '}
            <span className="font-medium capitalize">{status}</span>.
          </p>
          
          {/* Order ID */}
          <p className="text-sm text-gray-500 mb-2">
            Payment ID: {orderId}
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Payment Status: {status}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Payment Method: {paymentMethod || '-'}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/user/dashboard/books/history?refresh=1"
              className="inline-block bg-[#111010] text-white px-6 py-2 rounded-lg w-full hover:bg-gray-900 transition-colors"
            >
              View History Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
