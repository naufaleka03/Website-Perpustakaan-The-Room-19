"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BiSearch } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import DetailSessionModal from "./DetailSessionModal";
import DetailEventModal from "./DetailEventModal";

const SearchIcon = () => (
  <svg
    className="w-4 h-4 absolute left-3 top-3 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const ReservationHistoryCard = ({
  name,
  shift,
  transactionId,
  amount,
  status,
  onDetailClick,
}) => {
  const getStatusClass = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="w-full h-auto bg-white rounded-2xl shadow-md border border-[#cdcdcd] p-4 flex items-center hover:bg-neutral-50 transition">
      <div className="flex justify-between items-center w-full">
        <div className="space-y-4">
          <div>
            <p className="text-neutral-500/70 text-xs font-medium">
              Reservation Name
            </p>
            <p className="text-black text-xs font-medium">{name}</p>
          </div>
          <div>
            <p className="text-neutral-500/70 text-xs font-medium">Shift</p>
            <p className="text-black text-xs font-medium">{shift}</p>
          </div>
        </div>
        <div className="space-y-2 flex flex-col items-end">
          {status && (
            <div
              className={`px-4 py-1 rounded-lg text-xs font-semibold ${getStatusClass(
                status
              )}`}
            >
              {status}
            </div>
          )}
          <div className="text-right">
            <p className="text-stone-500 text-xs font-semibold">Total Cost</p>
            <p className="text-black text-xs font-semibold">{amount}</p>
          </div>
          <button
            onClick={onDetailClick}
            className="bg-lime-950 text-white px-6 py-2 rounded-lg inline-block text-center text-xs font-medium hover:bg-lime-900 transition-colors"
          >
            Detail
          </button>
        </div>
      </div>
    </div>
  );
};

const ReservationHistorySkeleton = () => (
  <div className="w-full h-auto bg-white rounded-2xl shadow-md border border-[#cdcdcd] p-4 flex items-center animate-pulse">
    <div className="flex justify-between items-center w-full">
      <div className="space-y-4">
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
      <div className="space-y-2 flex flex-col items-end">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="text-right">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
);

const TabButton = ({ isActive, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold font-manrope ${
        isActive ? "text-lime-950" : "text-stone-500"
      }`}
    >
      {children}
    </button>
  );
};

export default function Histories() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("session");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("All Status");
  const [sessionHistory, setSessionHistory] = useState([]);
  const [eventHistory, setEventHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && (tabFromUrl === "session" || tabFromUrl === "event")) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchSessionHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/sessions/history");
        if (!response.ok) {
          throw new Error("Failed to fetch session history");
        }
        const data = await response.json();
        setSessionHistory(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setSessionHistory([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchEventHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/eventreservations/history");
        if (!response.ok) {
          throw new Error("Failed to fetch event history");
        }
        const data = await response.json();
        setEventHistory(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setEventHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "session") {
      fetchSessionHistory();
    } else if (activeTab === "event") {
      fetchEventHistory();
    }
  }, [activeTab]);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  const openModal = (session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  const getStatus = (itemStatus, paymentStatus) => {
    if (itemStatus === "canceled") return "Cancelled";
    if (["capture", "settlement"].includes(paymentStatus)) return "Paid";
    if (["deny", "cancel", "expire"].includes(paymentStatus))
      return "Cancelled";
    return "Pending";
  };

  const filteredSessionHistory = sessionHistory.filter((session) => {
    const searchTerm = searchQuery.toLowerCase();
    const fullName = session.full_name.toLowerCase();
    const shiftDisplay = `${session.shift_name} (${session.shift_start
      .substring(0, 5)
      .replace(":", ".")} - ${session.shift_end
      .substring(0, 5)
      .replace(":", ".")})`.toLowerCase();

    const searchMatch =
      fullName.includes(searchTerm) || shiftDisplay.includes(searchTerm);

    if (selectedOption === "All Status") {
      return searchMatch;
    }
    const status = getStatus(session.status, session.payment_status);
    return searchMatch && status === selectedOption;
  });

  const filteredEventHistory = eventHistory.filter((event) => {
    const searchTerm = searchQuery.toLowerCase();
    const eventName = event.event_name.toLowerCase();
    const searchMatch = eventName.includes(searchTerm);

    if (selectedOption === "All Status") {
      return searchMatch;
    }
    const status = getStatus(event.status, event.payment_status);
    return searchMatch && status === selectedOption;
  });

  return (
    <div className="max-w-[1440px] mx-auto p-6 bg-white min-h-[70vh] flex flex-col">
      <div className="max-w-[932px] mx-auto flex-1 flex flex-col">
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
            className={`absolute bottom-0 h-0.5 bg-lime-950 transition-transform duration-300 ${
              activeTab === "event"
                ? "w-[140px] translate-x-[128px]"
                : "w-[130px] translate-x-0"
            }`}
          />
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <BiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[40px] bg-neutral-50 rounded-2xl border border-[#cdcdcd] pl-10 text-[#666666] text-xs font-normal font-manrope"
            />
          </div>

          <div className="w-[383px] relative">
            <div
              className="w-full h-[40px] bg-neutral-50 rounded-2xl border border-[#cdcdcd] px-4 flex items-center justify-between cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="text-black text-xs font-normal font-manrope">
                {selectedOption}
              </span>
              <IoIosArrowDown className="text-gray-400" size={18} />
            </div>
            {isDropdownOpen && (
              <div className="absolute w-full mt-2 bg-white rounded-xl border border-[#cdcdcd] shadow-lg overflow-hidden z-10">
                <div className="py-2">
                  {["All Status", "Paid", "Cancelled"].map((opt) => (
                    <button
                      key={opt}
                      className="w-full px-4 py-2 text-left text-xs text-[#666666] font-normal hover:bg-[#eff0c3] hover:text-[#52570d]"
                      onClick={() => handleSelectOption(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-start">
          {activeTab === "session" && (
            <div className="space-y-4">
              {loading && (
                <>
                  <ReservationHistorySkeleton />
                  <ReservationHistorySkeleton />
                  <ReservationHistorySkeleton />
                </>
              )}
              {error && <p className="text-red-500 text-center">{error}</p>}
              {!loading && !error && filteredSessionHistory.length === 0 && (
                <p className="text-center text-gray-500">
                  No history available at the moment
                </p>
              )}
              {!loading &&
                !error &&
                filteredSessionHistory
                  .sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                  )
                  .map((session) => {
                    const arrival = new Date(session.arrival_date);
                    const date = arrival.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                    const time = session.shift_start
                      .substring(0, 5)
                      .replace(":", ".");
                    const displayDate = `${date} ${time}`;
                    const startTime = session.shift_start
                      .substring(0, 5)
                      .replace(":", ".");
                    const endTime = session.shift_end
                      .substring(0, 5)
                      .replace(":", ".");
                    const shiftDisplay = `${session.shift_name} (${startTime} - ${endTime})`;

                    const status = getStatus(
                      session.status,
                      session.payment_status
                    );

                    return (
                      <ReservationHistoryCard
                        key={session.id}
                        name={session.full_name}
                        shift={shiftDisplay}
                        transactionId={session.payment_id || "N/A"}
                        amount={
                          session.amount
                            ? `Rp${session.amount.toLocaleString("id-ID")}`
                            : "Free"
                        }
                        status={status}
                        onDetailClick={() => openModal(session)}
                      />
                    );
                  })}
            </div>
          )}

          {activeTab === "event" && (
            <div className="space-y-4">
              {loading && (
                <>
                  <ReservationHistorySkeleton />
                  <ReservationHistorySkeleton />
                  <ReservationHistorySkeleton />
                </>
              )}
              {error && <p className="text-red-500 text-center">{error}</p>}
              {!loading && !error && filteredEventHistory.length === 0 && (
                <p className="text-center text-gray-500">
                  No history available at the moment
                </p>
              )}
              {!loading &&
                !error &&
                filteredEventHistory
                  .sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                  )
                  .map((event) => {
                    const status = getStatus(
                      event.status,
                      event.payment_status
                    );
                    return (
                      <ReservationHistoryCard
                        key={event.id}
                        name={event.full_name || event.event_name}
                        shift={event.shift_name}
                        transactionId={event.payment_id || "N/A"}
                        amount={
                          event.ticket_fee
                            ? `Rp${event.ticket_fee.toLocaleString("id-ID")}`
                            : "Free"
                        }
                        status={status}
                        onDetailClick={() => openEventModal(event)}
                      />
                    );
                  })}
            </div>
          )}
        </div>
      </div>
      <DetailSessionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        session={selectedSession}
      />
      <DetailEventModal
        isOpen={isEventModalOpen}
        onClose={closeEventModal}
        event={selectedEvent}
      />
    </div>
  );
}
