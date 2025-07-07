"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/supabase/client";

export default function PaymentSummaryEventsModal({
  isOpen,
  onClose,
  eventData,
  onPaymentSuccess,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const calculateAmount = () => {
    const basePrice = eventData.ticket_fee;
    const groupPrice = eventData.members?.length
      ? basePrice * eventData.members.length
      : 0;
    return basePrice + groupPrice;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError("");

    try {
      const amount = calculateAmount();

      // Truncate event name to prevent "Name too long" error
      const truncatedEventName =
        eventData.event_name.length > 50
          ? eventData.event_name.substring(0, 47) + "..."
          : eventData.event_name;

      const paymentData = {
        amount: amount,
        customerName: eventData.full_name,
        customerEmail: "customer@example.com",
        customerPhone: "08123456789",
        items: [
          {
            id: "EVENT_RESERVATION",
            price: amount,
            quantity: 1,
            name: `Event: ${truncatedEventName}`,
          },
        ],
        paymentType: "bank_transfer",
        bank: "bca",
      };

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success && result.data.token) {
        window.snap.pay(result.data.token, {
          onSuccess: async (result) => {
            try {
              // Combine event data with payment result
              const reservationData = {
                ...eventData,
                payment_id: result.order_id,
                payment_status: result.transaction_status,
                payment_method: result.payment_type,
              };

              const submitResult = await fetch("/api/eventreservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reservationData),
              });

              const responseData = await submitResult.json();

              if (responseData.success) {
                router.push(
                  `/user/dashboard/reservation/event-list/payment-finish?order_id=${reservationData.payment_id}&transaction_status=${reservationData.payment_status}`
                );
              } else {
                throw new Error(
                  responseData.error || "Failed to save reservation"
                );
              }
            } catch (err) {
              console.error("Error saving reservation:", err);
              setError(
                "Payment successful but failed to save reservation: " +
                  err.message
              );
              setIsProcessing(false);
            }
          },
          onPending: (result) => {
            console.log("Payment pending:", result);
          },
          onError: (result) => {
            console.error("Payment error:", result);
            setError("Payment failed");
            setIsProcessing(false);
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

  if (!isOpen || !eventData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-[#111010] mb-4">
          Payment Summary
        </h3>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-sm text-[#666666]">Event</span>
            <span className="text-sm font-medium text-[#666666]">
              {eventData.event_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[#666666]">Date</span>
            <span className="text-sm font-medium text-[#666666]">
              {eventData.event_date}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[#666666]">Shift</span>
            <span className="text-sm font-medium text-[#666666]">
              {eventData.shift_name}
            </span>
          </div>
          {eventData.members && eventData.members.length > 0 && (
            <div>
              <span className="text-sm text-[#666666] block mb-2">
                Group Members:
              </span>
              {eventData.members.map((member, index) => (
                <span key={index} className="text-sm text-[#666666] block pl-4">
                  • {member}
                </span>
              ))}
            </div>
          )}
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
