"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentFinishEventPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const status = searchParams.get("transaction_status");
  const paymentMethod = searchParams.get("payment_type");

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
    <div className="min-h-screen flex items-center justify-center bg-[#5f5f2c]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-[#e5e5e5] font-['Poppins']">
        <div className="flex flex-col items-center text-center">
          <div className={`rounded-full ${statusInfo.bgColor} p-3 mb-3`}>
            {statusInfo.icon}
          </div>
          <h2
            className={`text-lg font-semibold ${statusInfo.color} mb-2 font-['Poppins']`}
          >
            {statusInfo.message}
          </h2>
          <p className="text-[#666] text-xs font-['Poppins'] mb-3">
            Your event reservation has been confirmed.
            <br />
            Payment status:{" "}
            <span className="font-semibold capitalize">{status}</span>.
          </p>
          <div className="w-full flex flex-col gap-1 mb-4">
            <div className="flex justify-between text-xs text-[#888] font-['Poppins']">
              <span className="font-medium">Payment ID</span>
              <span>{orderId}</span>
            </div>
            <div className="flex justify-between text-xs text-[#888] font-['Poppins']">
              <span className="font-medium">Payment Status</span>
              <span className="capitalize">{status}</span>
            </div>
            <div className="flex justify-between text-xs text-[#888] font-['Poppins']">
              <span className="font-medium">Payment Method</span>
              <span>{paymentMethod || "-"}</span>
            </div>
          </div>
          <Link
            href="/user/dashboard/reservation/histories?tab=event"
            className="inline-block bg-[#2e3105] text-white text-xs font-['Poppins'] px-6 py-2 rounded-lg w-full hover:bg-[#3e4310] transition-colors font-medium shadow"
          >
            View My Event History
          </Link>
        </div>
      </div>
    </div>
  );
}
