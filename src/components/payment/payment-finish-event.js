"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentFinishEventPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const status = searchParams.get("transaction_status");

  // Helper function to get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case "capture":
      case "settlement":
        return {
          color: "text-green-600",
          bgColor: "bg-green-100",
          icon: (
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
          message: "Payment Successful!",
        };
      case "pending":
        return {
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          icon: (
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          message: "Payment Pending",
        };
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          icon: (
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          message: "Processing Payment",
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-4">
            <div className={`rounded-full ${statusInfo.bgColor} p-3`}>
              {statusInfo.icon}
            </div>
          </div>

          {/* Status Message */}
          <h2 className={`text-2xl font-bold ${statusInfo.color} mb-4`}>
            {statusInfo.message}
          </h2>

          <p className="text-gray-600 mb-4">
            Your event reservation has been confirmed and payment status is{" "}
            <span className="font-medium capitalize">{status}</span>.
          </p>

          {/* Order ID */}
          <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/user/dashboard/reservation/event-list"
              className="inline-block bg-[#111010] text-white px-6 py-2 rounded-lg w-full hover:bg-gray-900 transition-colors"
            >
              View My Event Reservations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
