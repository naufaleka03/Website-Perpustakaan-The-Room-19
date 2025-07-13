import React from "react";

const getStatusBadge = (status) => {
  let badgeClass = "px-2 py-1 rounded-lg text-xs font-medium inline-block ";
  let label = status || "-";
  if (label === "Available") {
    badgeClass += "bg-green-100 text-green-800";
  } else if (label === "On Loan") {
    badgeClass += "bg-blue-100 text-blue-800";
  } else if (label === "Retired") {
    badgeClass += "bg-gray-200 text-gray-800";
  } else {
    badgeClass += "bg-yellow-100 text-yellow-800";
  }
  return <span className={badgeClass}>{label}</span>;
};

const getConditionBadge = (condition) => {
  const cond = (condition || "").toLowerCase();
  let badgeClass = "px-2 py-1 rounded-lg text-xs font-medium inline-block ";
  let label = condition || "-";
  if (cond === "not specified" || cond === "not_specified") {
    badgeClass += "bg-yellow-100 text-yellow-800";
  } else if (cond === "pristine") {
    badgeClass += "bg-green-100 text-green-800";
  } else if (cond === "good") {
    badgeClass += "bg-blue-100 text-blue-800";
  } else if (cond === "fair") {
    badgeClass += "bg-orange-100 text-orange-800";
  } else if (cond === "poor") {
    badgeClass += "bg-red-200 text-red-800";
  } else {
    badgeClass += "text-[#666666]";
  }
  return <span className={badgeClass}>{label}</span>;
};

const DetailModal = ({ isOpen, onClose, book }) => {
  if (!isOpen || !book) return null;
  // Ambil status dari dynamic_status jika ada, fallback ke status
  const status = book.dynamic_status || book.status || "-";
  const condition = book.condition || "-";
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
          <div>{getStatusBadge(status)}</div>
        </div>
        <div className="mb-4">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Condition:
          </label>
          <div>{getConditionBadge(condition)}</div>
        </div>
        <div className="mb-4">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Handle By:
          </label>
          <p className="text-sm text-[#666666] font-normal font-['Poppins']">
            {book.staff_name ? book.staff_name : book.handle_by || "-"}
          </p>
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
