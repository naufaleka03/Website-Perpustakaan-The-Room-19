import { useState } from 'react';

export default function PaymentSummaryExtend({ isOpen, onClose, bookTitle, price, denda, newReturnDate, loanId }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const total = parseInt(price) + (denda ? parseInt(denda) : 0);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const paymentData = {
        amount: total,
        customerName: bookTitle,
        customerEmail: 'customer@example.com',
        customerPhone: '08123456789',
        items: [{
          id: loanId,
          price: total,
          quantity: 1,
          name: `Extend - ${bookTitle}`
        }],
        paymentType: 'gopay'
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
            window.location.href = `/user/dashboard/payment-finish?order_id=${result.order_id}&transaction_status=${result.transaction_status}&payment_type=${result.payment_type}&loan_id=${loanId}`;
          },
          onPending: () => setIsProcessing(false),
          onError: () => {
            setError('Pembayaran gagal');
            setIsProcessing(false);
          },
          onClose: () => setIsProcessing(false)
        });
      } else {
        throw new Error('Gagal mendapatkan token pembayaran');
      }
    } catch (err) {
      setError(err.message || 'Gagal memproses pembayaran');
      setIsProcessing(false);
    }
  };

  // Cegah close modal saat isProcessing
  const handleModalClick = (e) => {
    if (isProcessing) {
      e.stopPropagation();
      return;
    }
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleModalClick}>
      <div className="bg-white rounded-xl p-6 w-[400px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-[#111010] mb-4">Payment Summary (Extend)</h3>
        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-sm text-[#666666]">Book</span>
            <span className="text-sm font-medium text-[#666666]">{bookTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[#666666]">Price</span>
            <span className="text-sm font-medium text-[#666666]">Rp {parseInt(price).toLocaleString('id-ID')}</span>
          </div>
          {denda > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-[#666666]">Denda</span>
              <span className="text-sm font-medium text-[#e53e3e]">Rp {parseInt(denda).toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-[#666666]">New Return Date</span>
            <span className="text-sm font-medium text-[#666666]">{newReturnDate}</span>
          </div>
          <div className="border-t border-gray-200 my-4"></div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-[#666666]">Total</span>
            <span className="text-sm font-medium text-[#111010]">Rp {total.toLocaleString('id-ID')}</span>
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
            {isProcessing ? 'Processing...' : 'Process To Payment'}
          </button>
        </div>
      </div>
    </div>
  );
} 