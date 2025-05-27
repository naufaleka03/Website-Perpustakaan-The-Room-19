import { useState } from 'react';

export default function PaymentSummaryModal({ isOpen, onClose, book, borrowDate, returnDate, onPaymentSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !book) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');
    try {
      // Simpan data peminjaman ke localStorage
      const loanData = {
        user_id: book.user_id,
        book_id1: book.id,
        book_id2: null,
        book_title1: book.book_title,
        book_title2: null,
        genre1: book.genre,
        genre2: null,
        cover_image1: book.cover_image,
        cover_image2: null,
        price1: book.price,
        price2: null,
        full_name: book.full_name,
        email: book.email,
        phone_number: book.phone_number || '-',
      };
      localStorage.setItem('loanBookData', JSON.stringify(loanData));
      const paymentData = {
        amount: parseInt(book.price),
        customerName: book.book_title,
        customerEmail: 'customer@example.com', // Bisa diganti jika ada email user
        customerPhone: '08123456789', // Bisa diganti jika ada phone user
        items: [{
          id: book.id,
          price: parseInt(book.price),
          quantity: 1,
          name: book.book_title
        }],
        paymentType: 'gopay' // default, bisa diganti sesuai kebutuhan
      };
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success && result.data.token) {
        window.snap.pay(result.data.token, {
          onSuccess: (result) => {
            // Redirect ke payment-finish dengan parameter
            window.location.href = `/user/dashboard/payment-finish?order_id=${result.order_id}&transaction_status=${result.transaction_status}&payment_type=${result.payment_type}`;
          },
          onPending: (result) => {
            setIsProcessing(false);
          },
          onError: (result) => {
            setError('Pembayaran gagal');
            setIsProcessing(false);
          },
          onClose: () => {
            setIsProcessing(false);
          }
        });
      } else {
        throw new Error('Gagal mendapatkan token pembayaran');
      }
    } catch (err) {
      setError(err.message || 'Gagal memproses pembayaran');
      setIsProcessing(false);
    }
  };

  // Fungsi format tanggal ke DD-MM-YYYY
  const formatDate = (date) => {
    if (!date) return '-';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-[#111010] mb-4">Payment Summary</h3>
        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-sm text-[#666666]">Book</span>
            <span className="text-sm font-medium text-[#666666]">{book.book_title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[#666666]">Price</span>
            <span className="text-sm font-medium text-[#666666]">Rp {parseInt(book.price).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[#666666]">Borrow Date</span>
            <span className="text-sm font-medium text-[#666666]">{formatDate(borrowDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[#666666]">Return Date</span>
            <span className="text-sm font-medium text-[#666666]">{formatDate(returnDate)}</span>
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#666666] border border-[#666666]/30 rounded-lg hover:bg-gray-50"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="px-4 py-2 text-sm text-white bg-[#111010] rounded-lg hover:bg-[#2a2a2a] disabled:bg-gray-400"
          >
            {isProcessing ? 'Processing...' : 'Proceed To Payment'}
          </button>
        </div>
      </div>
    </div>
  );
} 