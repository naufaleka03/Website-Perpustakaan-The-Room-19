import { useState, useEffect } from 'react';

const RevokeConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedBookingId,
  isRevoke = false,
}) => {
  const [revokeReason, setRevokeReason] = useState('');

  // Reset reason when modal opens/closes
  useEffect(() => {
    if (!isOpen) setRevokeReason('');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="flex items-center justify-center min-h-full p-4">
        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg text-[#666666] font-medium mb-2">
            Revoke Membership
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {isRevoke
              ? 'Are you sure you want to revoke this membership? This action cannot be undone.'
              : 'Are you sure you want to cancel this booking?'}
          </p>
          <textarea
            className="w-full h-20 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 resize-none mb-4"
            placeholder={isRevoke ? "Reason for revocation (required)" : "Reason for cancellation (optional)"}
            value={revokeReason}
            onChange={e => setRevokeReason(e.target.value)}
            required={isRevoke}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              onClick={() => {
                onConfirm(selectedBookingId, revokeReason);
                setRevokeReason('');
              }}
              disabled={isRevoke && !revokeReason.trim()}
            >
              {isRevoke ? 'Revoke' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevokeConfirmationModal;