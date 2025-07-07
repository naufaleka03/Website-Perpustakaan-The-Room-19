import React, { useState, useEffect } from "react";

const conditionOptions = ["Pristine", "Good", "Fair", "Poor", "Not Specified"];

const AdjustCopiesModal = ({ isOpen, onClose, book, onUpdate }) => {
  const [condition, setCondition] = useState(
    book?.condition || "Not Specified"
  );
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (isOpen && book) {
      setCondition(book.condition || "Not Specified");
      setComment(book.comment || "");
    }
  }, [isOpen, book]);

  if (!isOpen || !book) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate({ condition, comment });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold text-[#111010] mb-6 font-['Poppins']">
          Update Copies Status
        </h2>
        <div className="mb-4">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Book Title:
          </label>
          <p className="text-sm text-[#666666] font-normal font-['Poppins']">
            {book.book_title}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-[#666666] text-sm font-medium font-['Poppins']">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full h-10 px-4 bg-zinc-100 rounded-lg border border-stone-300 text-sm font-normal text-gray-900 focus:outline-none focus:border-lime-950"
              required
            >
              {conditionOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="text-[#666666] text-sm font-medium font-['Poppins']">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full h-20 px-4 py-2 bg-zinc-100 rounded-lg border border-stone-300 text-sm font-normal text-gray-900 focus:outline-none focus:border-lime-950"
              placeholder="Enter comment (optional)"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-lime-950 text-white rounded-lg text-sm font-medium hover:bg-lime-900"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustCopiesModal;
