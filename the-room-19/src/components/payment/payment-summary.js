"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/supabase/client";

export default function PaymentSummaryModal({ isOpen, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    console.log("Payment Modal Reservation Data:", getStoredFormData());
  }, []);

  const getStoredFormData = () => {
    const stored = localStorage.getItem("reservationFormData");
    return stored ? JSON.parse(stored) : null;
  };

  const calculateAmount = () => {
    const basePrice =
      getStoredFormData().category === "Student" ? 25000 : 35000;
    const groupPrice = getStoredFormData().members?.length
      ? basePrice * getStoredFormData().members.length
      : 0;
    return basePrice + groupPrice;
  };

  const handlePaymentSuccess = async (result) => {
    try {
      console.log("Payment result:", result);

      const storedFormData = getStoredFormData();
      console.log("Retrieved stored form data:", storedFormData);

      if (!storedFormData) {
        throw new Error("No reservation data found");
      }

      // Combine stored form data with payment result
      const sessionData = {
        ...storedFormData,
        payment_id: result.order_id,
        payment_status: result.transaction_status,
        payment_method: result.payment_type,
        amount: calculateAmount(),
      };

      console.log("Final session data:", sessionData);

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });

      const responseData = await response.json();

      if (responseData.success) {
        // Clear stored data after successful submission
        localStorage.removeItem("reservationFormData");
        window.location.href = `/user/dashboard/payment-finish-session?order_id=${sessionData.payment_id}&transaction_status=${sessionData.payment_status}&payment_type=${sessionData.payment_method}`;
      } else {
        throw new Error(responseData.error || "Failed to submit reservation");
      }
    } catch (err) {
      console.error("Reservation submission error:", err);
      setError(
        "Payment successful but failed to save reservation: " + err.message
      );
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError("");

    try {
      const storedFormData = getStoredFormData();
      const amount = calculateAmount();

      const paymentData = {
        amount: amount,
        customerName: storedFormData.full_name,
        customerEmail: "customer@example.com",
        customerPhone: "08123456789",
        items: [
          {
            id: "SESSION_RESERVATION",
            price: amount,
            quantity: 1,
            name: `Session Reservation - ${storedFormData.category}`,
          },
        ],
      };

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data.token) {
        window.snap.pay(result.data.token, {
          onSuccess: (result) => handlePaymentSuccess(result),
          onPending: (result) => {
            console.log("Payment pending:", result);
          },
          onError: (result) => {
            console.error("Payment error:", result);
            setError("Payment failed");
          },
          onClose: () => {
            setIsProcessing(false);
          },
        });
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Failed to process payment");
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-[#111010] mb-4">
          Payment Summary
        </h3>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-sm text-[#666666]">Category</span>
            <span className="text-sm font-medium text-[#666666]">
              {getStoredFormData().category || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[#666666]">Date</span>
            <span className="text-sm font-medium text-[#666666]">
              {getStoredFormData().arrival_date}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[#666666]">Shift</span>
            <span className="text-sm font-medium text-[#666666]">
              {getStoredFormData().shift_name}
            </span>
          </div>
          <div className="border-t border-gray-200 my-4"></div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-[#666666]">
              Total Amount
            </span>
            <span className="text-sm font-medium text-[#666666]">
              Rp {calculateAmount().toLocaleString()}
            </span>
          </div>
        </div>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#666666] border border-[#666666]/30 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="px-4 py-2 text-sm text-white bg-[#111010] rounded-lg hover:bg-[#2a2a2a] disabled:bg-gray-400"
          >
            {isProcessing ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
