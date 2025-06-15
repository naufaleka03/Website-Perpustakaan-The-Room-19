import { useState } from 'react';

export default function PaymentSummaryFine({ isOpen, onClose, bookTitle, fine, loanId, onPaymentSuccess, onLoanUpdated }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const total = parseInt(fine);

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
          name: `Fine - ${bookTitle}`
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
          onSuccess: async (result) => {
            // Update kolom fine pada loans menjadi false
            try {
              await fetch(`/api/loans/${loanId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fine: false, payFine: true })
              });
              // Fetch ulang data loan jika ada callback
              if (onLoanUpdated) await onLoanUpdated();
            } catch (e) { /* ignore error, biar tetap redirect */ }
            if (onPaymentSuccess) onPaymentSuccess();
            if (typeof window !== 'undefined') {
              localStorage.setItem('fineAmount', total);
            }
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
      <div className="bg-white rounded-xl p-6 w-[400px] max-h-[90vh] overflow-y-auto font-poppins">
        <h3 className="text-lg font-sm text-[#e53e3e] mb-4">Payment Summary (Fine)</h3>
        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-xs text-[#666666]">Book</span>
            <span className="text-xs font-medium text-[#666666]">{bookTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-[#666666]">Fine</span>
            <span className="text-xs font-medium text-[#e53e3e]">Rp {parseInt(fine).toLocaleString('id-ID')}</span>
          </div>
          <div className="border-t border-gray-200 my-4"></div>
          <div className="flex justify-between">
            <span className="text-xs font-medium text-[#666666]">Total</span>
            <span className="text-xs font-medium text-[#111010]">Rp {total.toLocaleString('id-ID')}</span>
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-xs mb-4">{error}</div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-[#666666] border border-[#666666]/30 rounded-lg hover:bg-gray-50"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="px-4 py-2 text-xs text-white bg-[#e53e3e] rounded-lg hover:bg-[#b91c1c] disabled:bg-gray-400"
          >
            {isProcessing ? 'Processing...' : 'Pay Fine'}
          </button>
        </div>
      </div>
    </div>
  );
} 