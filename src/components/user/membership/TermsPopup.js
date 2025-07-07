"use client"
import { useState } from 'react';

export default function TermsPopup({ isOpen, onClose }) {
  const [termsText] = useState([
    "The borrower agrees to provide personal information, including their name, address, and contact number, and to upload a photo of an identity card (KTP/KTM/Student Card/SIM) for identity verification purposes. This personal information will be used exclusively for library administrative purposes and will not be shared with third parties without consent.",
    "Borrower agrees to pay the borrowing fee according to the type of book (imported or local) selected by the borrower.",
    "The borrower agrees to a fine of Rp5,000 per book per day in the event of a late return. Fines will accumulate until the book is returned.",
    "The borrower is responsible for the safety and condition of the book during the loan period. In the event of damage or loss, the borrower will be charged a replacement cost based on the current market price of the book.",
    "If the borrower does not respond within 2 days after the return deadline, The Room 19 reserves the right to contact the emergency number provided at the time of registration.",
    "If the borrower cannot be contacted within 15 days after the return deadline, The Room 19 reserves the right to visit the registered domicile address."
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl w-full text-center font-semibold text-[#111010]">Terms and Conditions</h1>
          <button 
            onClick={onClose}
            className="text-[#666666] hover:text-[#111010]"
          >
            ✕
          </button>
        </div>
        <ul className="text-sm text-[#666666] font-['Poppins'] list-disc pl-5 space-y-2">
          {termsText.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#111010] text-white rounded-lg text-sm hover:bg-[#333333] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
