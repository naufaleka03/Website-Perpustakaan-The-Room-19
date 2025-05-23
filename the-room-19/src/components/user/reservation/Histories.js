"use client";

import { useState } from "react";
import Link from "next/link";

const ReservationHistoryCard = ({
  date,
  name,
  shift,
  transactionId,
  amount,
  status,
}) => {
  return (
    <div className="w-[851px] h-40 p-4 bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] border border-neutral-500/50">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-lime-950 text-base font-semibold font-manrope">
            {date}
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-neutral-500/70 text-sm font-medium">
                Reservation Name
              </p>
              <p className="text-black text-sm font-medium">{name}</p>
            </div>
            <div>
              <p className="text-neutral-500/70 text-sm font-medium">Shift</p>
              <p className="text-black text-sm font-medium">{shift}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex flex-col items-center">
            <div className="bg-lime-100 px-4 py-1 rounded-lg">
              <p className="text-black text-base font-semibold">
                {transactionId}
              </p>
            </div>
            <p className="text-lime-950 text-base font-semibold mt-1">
              {status}
            </p>
          </div>
          <div className="text-center">
            <p className="text-stone-500 text-xs font-semibold">Total Cost</p>
            <p className="text-black text-sm font-semibold">{amount}</p>
          </div>
          <Link
            href={`/reservations/${transactionId}`}
            className="bg-lime-950 text-white px-6 py-2 rounded-lg inline-block text-center text-sm font-medium hover:bg-lime-900 transition-colors"
          >
            Detail
          </Link>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ isActive, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`text-xl font-semibold font-manrope ${
        isActive ? "text-lime-950" : "text-stone-500"
      }`}
    >
      {children}
    </button>
  );
};

export default function Histories() {
  const [activeTab, setActiveTab] = useState("session");

  return (
    <div className="max-w-[1440px] min-h-[982px] mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold font-manrope text-center mb-8">
        Reservation History
      </h1>

      <div className="max-w-[932px] mx-auto">
        <div className="flex gap-8 mb-4">
          <TabButton
            isActive={activeTab === "session"}
            onClick={() => setActiveTab("session")}
          >
            Session Reservation
          </TabButton>
          <TabButton
            isActive={activeTab === "event"}
            onClick={() => setActiveTab("event")}
          >
            Event Reservation
          </TabButton>
        </div>

        <div className="relative border-b border-neutral-500/60 mb-6">
          <div
            className={`absolute bottom-0 w-48 h-0.5 bg-lime-950 transition-transform duration-300 ${
              activeTab === "event" ? "translate-x-[271px]" : "translate-x-0"
            }`}
          />
        </div>

        <div className="bg-white rounded-[20px] border border-neutral-500/50 p-6">
          <div className="mb-6">
            <input
              type="date"
              className="w-64 h-10 px-4 bg-neutral-50 rounded-xl border border-stone-300 font-poppins"
              placeholder="Select transaction date"
            />
          </div>

          <div className="space-y-4">
            <ReservationHistoryCard
              date="03/11/2025 08.00"
              name="Wildan Fauzan Ramdana"
              shift="A (10.00 - 14.00)"
              transactionId="TR19191919"
              amount="Rp25.000"
              status="Paid"
            />
            {/* Add more ReservationHistoryCard components as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
