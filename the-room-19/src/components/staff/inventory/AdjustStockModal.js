"use client";

import { useState } from "react";

export default function AdjustStockModal({ isOpen, item, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(item?.stock_quantity || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm(quantity);
      onClose();
    } catch (error) {
      console.error("Error adjusting stock:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4 text-[#111010]">
          Adjust Stock
        </h2>

        <div className="mb-4">
          <p className="text-sm font-medium text-[#111010] mb-1">Item Name:</p>
          <p className="text-[#111010] text-base">{item?.item_name}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-[#111010] mb-3">Quantity:</p>
          <div className="flex items-center justify-center gap-4 bg-gray-50 p-3 rounded-lg">
            <button
              onClick={handleDecrement}
              className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-[#111010] text-xl font-medium shadow-sm"
            >
              -
            </button>
            <span className="text-2xl font-semibold w-20 text-center text-[#111010]">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-[#111010] text-xl font-medium shadow-sm"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-[#111010] hover:bg-gray-100 rounded-lg border border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#3F4B2C] hover:bg-[#2a2a2a]"
            }`}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
