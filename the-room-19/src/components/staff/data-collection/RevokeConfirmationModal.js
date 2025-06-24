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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h3 className="text-lg font-medium mb-2">
          {isRevoke ? 'Revoke Membership' : 'Cancel Booking'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {isRevoke
            ? 'Are you sure you want to revoke this membership? This action cannot be undone.'
            : 'Are you sure you want to cancel this booking?'}
        </p>
        <textarea
          className="w-full border rounded p-2 mb-2"
          placeholder={isRevoke ? "Reason for revocation (required)" : "Reason for cancellation (optional)"}
          value={revokeReason}
          onChange={e => setRevokeReason(e.target.value)}
          required={isRevoke}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(selectedBookingId, revokeReason);
              setRevokeReason('');
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
            disabled={isRevoke && !revokeReason.trim()}
          >
            {isRevoke ? 'Revoke' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevokeConfirmationModal;