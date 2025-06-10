"use client";

import { useState, useEffect } from "react";

export default function AdjustStockModal({ isOpen, item, onClose, onConfirm }) {
  const [mode, setMode] = useState("add"); // "add" or "reduce"
  const [amount, setAmount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState("");

  // Reset comment (dan amount) setiap kali modal dibuka atau item berubah
  useEffect(() => {
    if (isOpen) {
      setComment("");
      setAmount(1);
      setMode("add"); 
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const currentStock = item?.stock_quantity || 0;
  const isAdd = mode === "add";
  const isReduce = mode === "reduce";

  // Calculate new stock based on mode
  const newStock = isAdd
    ? currentStock + (isNaN(amount) ? 0 : Number(amount))
    : Math.max(0, currentStock - (isNaN(amount) ? 0 : Number(amount)));

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm(newStock, comment);
      onClose();
    } catch (error) {
      console.error("Error adjusting stock:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        {/* Tab Switcher */}
        <div className="flex mb-6 border-b border-[#E5E5E5]">
          <button
            className={`flex-1 pb-2 text-sm font-['Poppins'] transition-colors
              ${
                isAdd
                  ? "font-bold text-black border-b-4 border-black"
                  : "font-normal text-[#666] border-b-4 border-transparent"
              }
            `}
            onClick={() => setMode("add")}
            type="button"
          >
            Add Stock
          </button>
          <button
            className={`flex-1 pb-2 text-sm font-['Poppins'] transition-colors
              ${
                isReduce
                  ? "font-bold text-black border-b-4 border-black"
                  : "font-normal text-[#666] border-b-4 border-transparent"
              }
            `}
            onClick={() => setMode("reduce")}
            type="button"
          >
            Reduce Stock
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-[#111010] mb-1">Item Name:</p>
          <p className="text-[#111010] text-base">{item?.item_name}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-[#111010] mb-3">
            {isAdd ? "Add Quantity:" : "Reduce Quantity:"}
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={isReduce ? currentStock : undefined}
              value={amount}
              onChange={(e) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val) || val < 1) val = 1;
                if (isReduce && val > currentStock) val = currentStock;
                setAmount(val);
              }}
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-base text-[#111010] focus:outline-none focus:border-[#3F4B2C]"
              disabled={currentStock === 0 && isReduce}
            />
            <span className="text-[#666] text-sm">
              / Current: {currentStock}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[#111010] mb-2">
            Comment:
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter comment or reason for adjustment"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#111010] min-h-[60px] resize-none focus:outline-none focus:border-[#3F4B2C]"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-[#111010] hover:bg-gray-100 rounded-lg border border-gray-200"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (isReduce && currentStock === 0)}
            className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg ${
              isSubmitting || (isReduce && currentStock === 0)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#3F4B2C] hover:bg-[#2a2a2a]"
            }`}
            type="button"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
