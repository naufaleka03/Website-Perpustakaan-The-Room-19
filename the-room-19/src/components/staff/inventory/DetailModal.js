import React from "react";

const DetailModal = ({ isOpen, onClose, book }) => {
  if (!isOpen || !book) return null;
  // Pewarnaan status
  let statusClass =
    "text-sm font-normal font-['Poppins'] px-2 py-1 rounded-lg inline-block ";
  const status = book.status?.toLowerCase() || "";
  if (status === "not specified" || status === "not_specified") {
    statusClass += "bg-yellow-100 text-yellow-800";
  } else if (status === "pristine") {
    statusClass += "bg-green-100 text-green-800";
  } else if (status === "good") {
    statusClass += "bg-blue-100 text-blue-800";
  } else if (status === "fair") {
    statusClass += "bg-orange-100 text-orange-800";
  } else {
    statusClass += "text-[#666666]";
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[500px] max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold text-[#111010] mb-6 font-['Poppins']">
          Book Detail
        </h2>
        <div className="mb-4">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Book Title:
          </label>
          <p className="text-sm text-[#666666] font-normal font-['Poppins']">
            {book.book_title}
          </p>
        </div>
        <div className="mb-4">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Status:
          </label>
          <div>
            <span className={statusClass}>{book.status}</span>
          </div>
        </div>
        <div className="mb-4">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Comment:
          </label>
          <p className="text-sm text-[#666666] font-normal font-['Poppins']">
            {book.comment || "-"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
