import React from 'react';

const EarlyCheckoutModal = ({ isOpen, onClose, onConfirm, staff, currentTime, isEarlyCheckout = false }) => {
  if (!isOpen) return null;
  
  const title = isEarlyCheckout ? 'Early Clock-out Confirmation' : 'Clock-out Confirmation';
  const actionText = isEarlyCheckout ? 'early clock out' : 'clock out';
  const buttonText = isEarlyCheckout ? 'Confirm Early Clock-out' : 'Confirm Clock-out';
  const buttonColor = isEarlyCheckout ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600';
  const warningText = isEarlyCheckout 
    ? '⚠️ This action will record early clock-out for your shift.'
    : '⚠️ This action will record clock-out for your shift.';
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="mb-4">Are you sure you want to {actionText} <span className="font-semibold">{staff.name}</span> ?</p>
        <p className="mb-4 text-gray-600">Current Time: <span className="font-mono font-semibold">{currentTime}</span></p>
        <p className="mb-6 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">{warningText}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 ${buttonColor} text-white rounded-lg`}>{buttonText}</button>
        </div>
      </div>
    </div>
  );
};

export default EarlyCheckoutModal; 