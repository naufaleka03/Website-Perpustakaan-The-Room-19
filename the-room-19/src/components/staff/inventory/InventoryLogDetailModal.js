"use client";
import React from "react";

export default function InventoryLogDetailModal({ isOpen, log, onClose }) {
  if (!isOpen || !log) return null;

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay"
      onClick={(e) => {
        if (e.target.classList.contains("modal-overlay")) onClose();
      }}
    >
      <div className="bg-white rounded-xl p-6 w-[400px] max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold text-[#111010] mb-6">
          Inventory Log Detail
        </h2>
        <div className="mb-4">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Item:
          </label>
          <p className="text-sm text-[#111010]">{log.item_name}</p>
        </div>
        <div className="mb-4">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Date:
          </label>
          <p className="text-sm text-[#111010]">{formatDate(log.created_at)}</p>
        </div>
        <div className="mb-4">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Category:
          </label>
          <p className="text-sm text-[#111010]">{log.category_name}</p>
        </div>
        <div className="mb-4">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Action:
          </label>
          <p className="text-sm text-[#111010]">
            {log.mode === "add" ? (
              <span className="text-green-600 font-bold">Add (+)</span>
            ) : (
              <span className="text-red-600 font-bold">Reduce (-)</span>
            )}
          </p>
        </div>
        <div className="mb-4">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Stock Before:
          </label>
          <p className="text-sm text-[#111010]">{log.stock_before}</p>
        </div>
        <div className="mb-4">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Stock After:
          </label>
          <p className="text-sm text-[#111010]">{log.stock_after}</p>
        </div>
        <div className="mb-4">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Comment:
          </label>
          <p className="text-sm text-[#666666]">{log.comment || "-"}</p>
        </div>
        <div className="mb-4">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Handle by:
          </label>
          <p className="text-sm text-[#111010]">{log.staff_name || "-"}</p>
        </div>
      </div>
    </div>
  );
}
