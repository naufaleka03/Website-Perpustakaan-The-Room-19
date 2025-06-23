"use client";
import { useState, useEffect } from "react";
import {
  FaSearch,
  FaPlus,
  FaEllipsisV,
  FaSort,
  FaSyncAlt,
} from "react-icons/fa";
import { sessionData } from "./data/sessionData";
import { eventData } from "./data/eventData";
import CancelConfirmationModal from "./CancelConfirmationModal";
import { useRouter } from "next/navigation";
import DetailSessionModal from "./DetailSessionModal";
import DetailMembershipModal from "./DetailMembershipModal";
import { updateSessionStatus } from "@/app/lib/actions";
import DetailBorrowingModal from "./DetailBorrowingModal";

const formatDate = (dateString) => {
  if (!dateString) return "";
  let date;
  if (typeof dateString === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      // Format hanya tanggal, tambahkan offset WIB
      date = new Date(dateString + "T00:00:00+07:00");
    } else {
      // Sudah ISO atau ada waktu, parse langsung
      date = new Date(dateString);
    }
  } else {
    date = new Date(dateString);
  }
  if (isNaN(date.getTime())) {
    console.error("Invalid date:", dateString);
    return "";
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function DataCollection() {
  // Inisialisasi default 'session' (SSR/Client sama)
  const [activeTab, setActiveTab] = useState("session");

  // Setelah mount di client, update dari localStorage jika ada
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("staffDataCollectionActiveTab");
      if (savedTab && savedTab !== activeTab) {
        setActiveTab(savedTab);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionCurrentPage, setSessionCurrentPage] = useState(1);
  const [eventCurrentPage, setEventCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sessionData, setSessionData] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [sessionStatuses, setSessionStatuses] = useState([]);
  const [eventStatuses, setEventStatuses] = useState([]);
  const [sessionStatus, setSessionStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [membershipSearchQuery, setMembershipSearchQuery] = useState("");
  const router = useRouter();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [membershipData, setMembershipData] = useState([]);
  const [isDetailMembershipModalOpen, setIsDetailMembershipModalOpen] =
    useState(false);
  const [selectedMembershipId, setSelectedMembershipId] = useState(null);
  const [membershipStats, setMembershipStats] = useState({
    totalMembers: 0,
    totalRequests: 0,
    totalRevisions: 0,
  });
  const [borrowingBookData, setBorrowingBookData] = useState([]);
  const [borrowingBookSearchQuery, setBorrowingBookSearchQuery] = useState("");
  const [borrowingBookCurrentPage, setBorrowingBookCurrentPage] = useState(1);
  const [isDetailBorrowingModalOpen, setIsDetailBorrowingModalOpen] =
    useState(false);
  const [selectedBorrowingData, setSelectedBorrowingData] = useState(null);
  const [isRefreshingSession, setIsRefreshingSession] = useState(false);
  const [isRefreshingEvent, setIsRefreshingEvent] = useState(false);
  const [isRefreshingMembership, setIsRefreshingMembership] = useState(false);
  const [isRefreshingBorrowing, setIsRefreshingBorrowing] = useState(false);

  // Simpan tab aktif ke localStorage setiap kali berubah
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("staffDataCollectionActiveTab", activeTab);
    }
  }, [activeTab]);

  // Fungsi untuk mendapatkan data yang ditampilkan
  const getTableData = (data, page, itemsPerPage, searchQuery = "") => {
    let filteredData = filterDataByName(data, searchQuery);

    // Sort data based on sortOrder if it's sessions or events tab
    if (data === sessionData || data === eventData) {
      filteredData = [...filteredData].sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);

        if (sortOrder === "newest") {
          return dateB - dateA;
        }
        return dateA - dateB;
      });
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  // Fungsi untuk mendapatkan total halaman
  const getTotalPages = (data, itemsPerPage) =>
    Math.ceil(data.length / itemsPerPage);

  // Render pagination controls
  const PaginationControls = ({
    currentPage,
    setCurrentPage,
    data,
    itemsPerPage,
  }) => {
    const totalPages = getTotalPages(data, itemsPerPage);

    return (
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-1">
          <span className="text-xs text-[#666666] font-['Poppins']">Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-[#666666]/30 rounded px-2 py-1 text-xs text-[#666666]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-xs text-[#666666] font-['Poppins']">
            entries
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded text-xs ${
              currentPage === 1
                ? "bg-gray-100 text-[#666666]/50 cursor-not-allowed"
                : "bg-white text-[#666666] border border-[#666666]/30 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <span className="px-2 py-1 bg-[#111010] text-white rounded text-xs">
            {currentPage}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded text-xs ${
              currentPage === totalPages
                ? "bg-gray-100 text-[#666666]/50 cursor-not-allowed"
                : "bg-white text-[#666666] border border-[#666666]/30 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Update useEffect untuk fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sessions
        const sessionsResponse = await fetch("/api/sessions");
        const sessionsData = await sessionsResponse.json();
        const sortedSessionsData = sessionsData.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB - dateA;
        });
        setSessionData(sortedSessionsData);
        setSessionStatuses(
          sortedSessionsData.map((item) => ({
            id: item.id,
            status: item.status || "not attended",
            isCanceled: item.status === "canceled",
          }))
        );

        // Fetch event reservations
        const eventReservationsResponse = await fetch("/api/eventreservations");
        const eventReservationsData = await eventReservationsResponse.json();
        const sortedEventReservationsData = eventReservationsData.sort(
          (a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB - dateA;
          }
        );
        setEventData(sortedEventReservationsData);
        setEventStatuses(
          sortedEventReservationsData.map((item) => ({
            id: item.id,
            status: item.status || "not attended",
            isCanceled: item.status === "canceled",
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
      }
    };

    fetchData();
  }, [isModalOpen]);

  // Update handler untuk mengubah status session
  const handleSessionStatusChange = async (sessionId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append("status", newStatus);

      const result = await updateSessionStatus(sessionId, formData);

      if (result.success) {
        setSessionStatuses((prevStatuses) =>
          prevStatuses.map((status) =>
            status.id === sessionId ? { ...status, status: newStatus } : status
          )
        );
      }
    } catch (error) {
      console.error("Error updating session status:", error);
      setError("Failed to update session status. Please try again.");
    }
  };

  // Tambahkan state untuk membership status
  const [membershipStatuses, setMembershipStatuses] = useState(
    membershipData.map((item) => ({
      id: item.id,
      status: "request",
    }))
  );

  const handleMembershipStatusChange = (id, newStatus) => {
    setMembershipStatuses((prevStatuses) =>
      prevStatuses.map((status) =>
        status.id === id ? { ...status, status: newStatus } : status
      )
    );
  };

  // Pisahkan fungsi untuk menangani klik cancel booking dan konfirmasi cancel
  const handleCancelClick = (sessionId) => {
    setSelectedBookingId(sessionId);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleCancelConfirm = async (id, reason) => {
    try {
      const formData = new FormData();
      formData.append("status", "canceled");
      formData.append("cancellationReason", reason);

      let response;
      if (activeTab === "session") {
        response = await updateSessionStatus(id, formData);
      } else if (activeTab === "event") {
        // Get current event reservation data to calculate slots to return
        const currentReservation = await fetch(`/api/eventreservations/${id}`);
        const reservationData = await currentReservation.json();

        if (!currentReservation.ok) {
          throw new Error("Failed to fetch event reservation data");
        }

        // Calculate slots to return
        const slotsToReturn =
          1 + // Main person
          (reservationData.group_member1 ? 1 : 0) +
          (reservationData.group_member2 ? 1 : 0) +
          (reservationData.group_member3 ? 1 : 0) +
          (reservationData.group_member4 ? 1 : 0);

        console.log(`Returning ${slotsToReturn} slots to event availability`);

        // Update the event reservation status
        response = await fetch(`/api/eventreservations/${id}`, {
          method: "PUT",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to cancel event reservation");
        }

        response = await response.json();
      }

      if (
        (activeTab === "session" && response.success) ||
        (activeTab === "event" && response.success)
      ) {
        // Update local state for status
        if (activeTab === "session") {
          setSessionStatuses((prevStatuses) =>
            prevStatuses.map((status) =>
              status.id === id
                ? { ...status, status: "canceled", isCanceled: true }
                : status
            )
          );
        } else {
          setEventStatuses((prevStatuses) =>
            prevStatuses.map((status) =>
              status.id === id
                ? { ...status, status: "canceled", isCanceled: true }
                : status
            )
          );
        }

        // Close the modal
        setIsModalOpen(false);

        // Show success message
        setSuccessMessage(
          `${
            activeTab === "session" ? "Session" : "Event"
          } canceled successfully. Slots have been returned to availability.`
        );
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error(`Error canceling ${activeTab}:`, error);
      setError(`Failed to cancel ${activeTab}. Please try again.`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownButton = event.target.closest("button");
      const dropdownMenu = event.target.closest(".dropdown-menu");

      if (
        !dropdownButton?.classList.contains("dropdown-trigger") &&
        !dropdownMenu
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fungsi untuk mendapatkan data sesuai halaman
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return sessionData.slice(startIndex, endIndex);
  };

  // Update filterDataByName function untuk mencari berdasarkan nama dan judul buku
  const filterDataByName = (data, query) => {
    if (!data) return [];

    if (activeTab === "borrowing") {
      return data.filter(
        (item) =>
          item.full_name?.toLowerCase().includes(query.toLowerCase()) ||
          item.book_title1?.toLowerCase().includes(query.toLowerCase()) ||
          item.book_title2?.toLowerCase().includes(query.toLowerCase())
      );
    }
    return data.filter(
      (item) =>
        item.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        item.name?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Update event handler untuk search input
  const handleSearch = (e, setSearchFn) => {
    setSearchFn(e.target.value);
    setCurrentPage(1); // Reset halaman ke 1 ketika melakukan pencarian
  };

  const handleDetail = (sessionId) => {
    setSelectedSessionId(sessionId);
    setIsDetailModalOpen(true);
    setActiveDropdown(null);
  };

  // Tambahkan useEffect untuk handle click outside sort dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".sort-container")) {
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update fungsi handleSort
  const handleSort = (order) => {
    setSortOrder(order);
    setSortDropdownOpen(false);

    if (activeTab === "session") {
      const sortedData = [...sessionData].sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);

        if (order === "newest") {
          return dateB - dateA;
        }
        return dateA - dateB;
      });

      setSessionData(sortedData);
      setSessionCurrentPage(1);
    } else if (activeTab === "event") {
      const sortedData = [...eventData].sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);

        if (order === "newest") {
          return dateB - dateA;
        }
        return dateA - dateB;
      });

      setEventData(sortedData);
      setEventCurrentPage(1);
    }
  };

  // Add handleEventStatusChange function
  const handleEventStatusChange = async (eventId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append("status", newStatus);

      const response = await fetch(`/api/eventreservations/${eventId}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update event status");
      }

      // Update local state
      setEventStatuses((prevStatuses) =>
        prevStatuses.map((status) =>
          status.id === eventId ? { ...status, status: newStatus } : status
        )
      );

      setSuccessMessage("Event status updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating event status:", error);
      setError("Failed to update event status. Please try again.");
    }
  };

  // Update fetch function for membership data
  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await fetch("/api/memberships");
        if (!response.ok) {
          throw new Error("Failed to fetch memberships");
        }
        const data = await response.json();
        setMembershipData(data.memberships);
        setMembershipStats(data.stats);
      } catch (error) {
        console.error("Error fetching memberships:", error);
      }
    };

    if (activeTab === "membership") {
      fetchMemberships();
    }
  }, [activeTab]);

  const handleMembershipDetail = (membershipId) => {
    setSelectedMembershipId(membershipId);
    setIsDetailMembershipModalOpen(true);
    setActiveDropdown(null);
  };

  // Update fungsi getBorrowingStatus untuk menggunakan loan_due
  const getBorrowingStatus = (returnDate, status) => {
    if (status === "Returned") return "returned";
    // Gunakan waktu WIB
    const now = new Date();
    const wibOffset = 7 * 60; // menit
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const wibNow = new Date(utc + wibOffset * 60000);
    let returnDateObj = null;
    if (
      typeof returnDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(returnDate)
    ) {
      returnDateObj = new Date(returnDate + "T00:00:00+07:00");
    } else {
      returnDateObj = new Date(returnDate);
    }
    if (wibNow.setHours(0, 0, 0, 0) > returnDateObj.setHours(0, 0, 0, 0))
      return "overdue";
    return "ongoing";
  };

  // Update useEffect untuk mengambil data peminjaman dari API
  const fetchLoans = async () => {
    try {
      const response = await fetch("/api/loans");
      const data = await response.json();

      if (data && data.loans) {
        // Sortir data berdasarkan created_at (terbaru terlebih dahulu)
        const sortedData = data.loans.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB - dateA;
        });

        setBorrowingBookData(sortedData);
      }
    } catch (error) {
      console.error("Error fetching loans data:", error);
    }
  };

  // PATCH ke /api/loans setiap kali tab borrowing diakses
  useEffect(() => {
    if (activeTab === 'borrowing') {
      fetch('/api/loans', { method: 'PATCH' });
      fetchLoans();
    }
  }, [activeTab]);

  // Update fungsi handleDetailBorrowing untuk menggunakan struktur data baru
  const handleDetailBorrowing = (borrowingId) => {
    const borrowingData = borrowingBookData.find(
      (data) => data.id === borrowingId
    );

    if (borrowingData) {
      // Transformasi data sesuai format yang diharapkan DetailBorrowingModal
      const formattedData = {
        id: borrowingData.id,
        name: borrowingData.full_name,
        book1: borrowingData.book_title1,
        book2: borrowingData.book_title2 || null,
        borrowing_date: borrowingData.loan_start,
        return_date: borrowingData.loan_due,
        status: borrowingData.status,
        email: borrowingData.email,
        phone: borrowingData.phone_number,
        copies: borrowingData.copies,
      };

      setSelectedBorrowingData(formattedData);
      setIsDetailBorrowingModalOpen(true);
    }

    setActiveDropdown(null);
  };

  // Update fungsi handleReturnBook untuk menggunakan API
  const handleReturnBook = async (bookId) => {
    try {
      const response = await fetch(`/api/loans/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Returned" }),
      });

      if (response.ok) {
        // Update status di state lokal
        setBorrowingBookData((prevData) =>
          prevData.map((book) =>
            book.id === bookId ? { ...book, status: "Returned" } : book
          )
        );

        // Tutup modal
        setIsDetailBorrowingModalOpen(false);
      } else {
        console.error("Failed to update book status");
      }
    } catch (error) {
      console.error("Error updating book status:", error);
    }
  };

  // Define fetch functions for each tab
  const fetchSessions = async () => {
    try {
      setIsRefreshingSession(true);
      // Fetch sessions only
      const sessionsResponse = await fetch("/api/sessions");
      const sessionsData = await sessionsResponse.json();
      const sortedSessionsData = sessionsData.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA;
      });
      setSessionData(sortedSessionsData);
      setSessionStatuses(
        sortedSessionsData.map((item) => ({
          id: item.id,
          status: item.status || "not attended",
          isCanceled: item.status === "canceled",
        }))
      );
    } finally {
      setIsRefreshingSession(false);
    }
  };
  const fetchEvents = async () => {
    try {
      setIsRefreshingEvent(true);
      // Fetch events only
      const eventReservationsResponse = await fetch("/api/eventreservations");
      const eventReservationsData = await eventReservationsResponse.json();
      const sortedEventReservationsData = eventReservationsData.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA;
      });
      setEventData(sortedEventReservationsData);
      setEventStatuses(
        sortedEventReservationsData.map((item) => ({
          id: item.id,
          status: item.status || "not attended",
          isCanceled: item.status === "canceled",
        }))
      );
    } finally {
      setIsRefreshingEvent(false);
    }
  };
  const fetchMembershipsTab = async () => {
    try {
      setIsRefreshingMembership(true);
      const response = await fetch("/api/memberships");
      if (!response.ok) {
        throw new Error("Failed to fetch memberships");
      }
      const data = await response.json();
      setMembershipData(data.memberships);
      setMembershipStats(data.stats);
    } catch (error) {
      console.error("Error fetching memberships:", error);
    } finally {
      setIsRefreshingMembership(false);
    }
  };
  const fetchBorrowing = async () => {
    try {
      setIsRefreshingBorrowing(true);
      await fetchLoans();
    } finally {
      setIsRefreshingBorrowing(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Returned":
        return "bg-green-100 text-green-800";
      case "On Going":
        return "bg-yellow-100 text-yellow-800";
      case "Due Date":
        return "bg-yellow-100 text-yellow-800"; 
      case "Over Due":
        return "bg-red-100 text-red-800"; 
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative mb-4">
        <div className="bg-gradient-to-l from-[#4d4d4d] to-black w-full h-[200px] flex items-center">
          <div className="max-w-[1440px] w-full mx-auto px-4 lg:px-8">
            <h1
              className={`text-[#fcfcfc] text-5xl font-medium leading-[48px] font-manrope`}
            >
              DATA <br />
              COLLECTION
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-[1440px] w-full mx-auto px-8 lg:px-12 pb-16">
        {/* Tab Navigation */}
        <div className="flex border-b border-[#666666]/10 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("session")}
            className={`px-6 py-3 text-sm transition-all relative ${
              activeTab === "session"
                ? "text-[#111010] font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#111010]"
                : "text-[#666666]"
            }`}
          >
            Session Reservation
          </button>
          <button
            onClick={() => setActiveTab("event")}
            className={`px-6 py-3 text-sm transition-all relative ${
              activeTab === "event"
                ? "text-[#111010] font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#111010]"
                : "text-[#666666]"
            }`}
          >
            Event Reservation
          </button>
          <button
            onClick={() => setActiveTab("membership")}
            className={`px-6 py-3 text-sm transition-all relative ${
              activeTab === "membership"
                ? "text-[#111010] font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#111010]"
                : "text-[#666666]"
            }`}
          >
            Membership
          </button>
          <button
            onClick={() => setActiveTab("borrowing")}
            className={`pl-6 py-3 text-sm transition-all relative ${
              activeTab === "borrowing"
                ? "text-[#111010] font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#111010]"
                : "text-[#666666]"
            }`}
          >
            Borrowing Book
          </button>
        </div>

        {/* Tables Section */}
        <div className="w-full overflow-x-auto">
          {activeTab === "session" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e, setSearchQuery)}
                      className="w-[360px] h-[35px] rounded-2xl border border-[#666666]/30 pl-9 pr-4 text-xs font-normal font-['Poppins'] text-[#666666]"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
                  </div>
                  <div className="relative sort-container">
                    <button
                      onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#666666]/30 text-xs font-normal font-['Poppins'] text-[#666666] transition-colors duration-200 hover:bg-gray-100 hover:text-[#111010]"
                    >
                      <FaSort />
                      Sort
                    </button>
                    {sortDropdownOpen && (
                      <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-lg border border-[#666666]/10 py-1 z-10 min-w-[150px]">
                        <button
                          onClick={() => handleSort("newest")}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-100 transition-colors duration-200 ${
                            sortOrder === "newest"
                              ? "text-[#111010] font-medium"
                              : "text-[#666666]"
                          }`}
                        >
                          Newest First
                        </button>
                        <button
                          onClick={() => handleSort("oldest")}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-100 transition-colors duration-200 ${
                            sortOrder === "oldest"
                              ? "text-[#111010] font-medium"
                              : "text-[#666666]"
                          }`}
                        >
                          Oldest First
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchSessions}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#666666]/30 text-xs font-normal font-['Poppins'] text-[#2e3105] bg-white hover:bg-[#f2f2f2] transition-colors duration-200"
                    style={{ minWidth: 40 }}
                    aria-label="Refresh"
                    type="button"
                    disabled={isRefreshingSession}
                  >
                    <FaSyncAlt
                      className={isRefreshingSession ? "animate-spin" : ""}
                    />
                  </button>
                  {activeTab === "session" && (
                    <button
                      onClick={() =>
                        router.push(
                          "/staff/dashboard/data-collection/create-session"
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-[#111010] text-white rounded-xl text-xs font-['Poppins'] transition-colors duration-200 hover:bg-[#232323]"
                    >
                      <FaPlus size={12} />
                      Create
                    </button>
                  )}
                </div>
              </div>
              <div className="min-w-[768px] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#eaeaea]">
                      <th className="first:rounded-tl-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        No
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Name
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Date
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Shift
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Category
                      </th>
                      <th className="first:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Status
                      </th>
                      <th className="first:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTableData(
                      sessionData,
                      sessionCurrentPage,
                      entriesPerPage,
                      searchQuery
                    ).map((session, index) => (
                      <tr
                        key={session.id}
                        className={`border-b border-[#666666]/10 hover:bg-gray-100 cursor-pointer transition-colors duration-200`}
                        onClick={() => setSelectedRow(session.id)}
                        onMouseLeave={() => setSelectedRow(null)}
                      >
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {(sessionCurrentPage - 1) * entriesPerPage +
                            index +
                            1}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {session.full_name}
                          {(() => {
                            const groupMembers = [
                              session.group_member1,
                              session.group_member2,
                              session.group_member3,
                              session.group_member4,
                            ];
                            const groupCount = groupMembers.filter(
                              (m) => m && m.trim()
                            ).length;
                            return groupCount > 0 ? (
                              <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-medium text-gray-700 bg-gray-200 rounded-full align-middle">
                                +{groupCount}
                              </span>
                            ) : null;
                          })()}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {formatDate(session.arrival_date)}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {session.shift_name}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {session.category}
                        </td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] text-center">
                          {sessionStatuses.find(
                            (status) => status.id === session.id
                          )?.status === "canceled" ? (
                            <span className="px-2 py-1 rounded-lg text-xs text-red-800 bg-red-100">
                              Canceled
                            </span>
                          ) : (
                            <select
                              value={
                                sessionStatuses.find(
                                  (status) => status.id === session.id
                                )?.status || "not attended"
                              }
                              onChange={(e) =>
                                handleSessionStatusChange(
                                  session.id,
                                  e.target.value
                                )
                              }
                              className={`px-2 py-1 rounded-lg text-xs ${
                                sessionStatuses.find(
                                  (status) => status.id === session.id
                                )?.status === "attended"
                                  ? "text-green-800 bg-green-100"
                                  : "text-yellow-800 bg-yellow-100"
                              }`}
                            >
                              <option
                                value="not attended"
                                className="text-yellow-800 bg-white"
                              >
                                Not Attended
                              </option>
                              <option
                                value="attended"
                                className="text-green-800 bg-white"
                              >
                                Attended
                              </option>
                            </select>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] text-center relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(
                                activeDropdown === session.id
                                  ? null
                                  : session.id
                              );
                            }}
                            className="hover:bg-gray-100 p-2 rounded-full dropdown-trigger"
                          >
                            <FaEllipsisV className="text-[#666666]" />
                          </button>

                          {activeDropdown === session.id && (
                            <div
                              className="absolute right-0 w-36 bg-white rounded-lg shadow-lg border border-[#666666]/10 z-10 dropdown-menu"
                              style={{
                                top:
                                  selectedRow === session.id ? "auto" : "100%",
                                bottom:
                                  selectedRow === session.id ? "100%" : "auto",
                                transform:
                                  selectedRow === session.id
                                    ? "translateY(0)"
                                    : "translateY(-100%)",
                              }}
                            >
                              <button
                                className={`w-full text-left px-4 py-2 text-xs text-[#666666] hover:bg-gray-100 transition-colors duration-200 ${
                                  sessionStatuses.find(
                                    (status) => status.id === session.id
                                  )?.status === "canceled"
                                    ? "rounded-lg"
                                    : "rounded-t-lg"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDetail(session.id);
                                  setActiveDropdown(null);
                                }}
                              >
                                Detail
                              </button>
                              {sessionStatuses.find(
                                (status) => status.id === session.id
                              )?.status !== "canceled" && (
                                <button
                                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-b-lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelClick(session.id);
                                    setActiveDropdown(null);
                                  }}
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={sessionCurrentPage}
                setCurrentPage={setSessionCurrentPage}
                data={sessionData}
                itemsPerPage={entriesPerPage}
              />
            </>
          )}

          {activeTab === "event" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name"
                      value={eventSearchQuery}
                      onChange={(e) => handleSearch(e, setEventSearchQuery)}
                      className="w-[360px] h-[35px] rounded-2xl border border-[#666666]/30 pl-9 pr-4 text-xs font-normal font-['Poppins'] text-[#666666]"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
                  </div>
                  <div className="relative sort-container">
                    <button
                      onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#666666]/30 text-xs font-normal font-['Poppins'] text-[#666666] transition-colors duration-200 hover:bg-gray-100 hover:text-[#111010]"
                    >
                      <FaSort />
                      Sort
                    </button>
                    {sortDropdownOpen && (
                      <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-lg border border-[#666666]/10 py-1 z-10 min-w-[150px]">
                        <button
                          onClick={() => handleSort("newest")}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-100 transition-colors duration-200 ${
                            sortOrder === "newest"
                              ? "text-[#111010] font-medium"
                              : "text-[#666666]"
                          }`}
                        >
                          Newest First
                        </button>
                        <button
                          onClick={() => handleSort("oldest")}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-100 transition-colors duration-200 ${
                            sortOrder === "oldest"
                              ? "text-[#111010] font-medium"
                              : "text-[#666666]"
                          }`}
                        >
                          Oldest First
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchEvents}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#666666]/30 text-xs font-normal font-['Poppins'] text-[#2e3105] bg-white hover:bg-[#f2f2f2] transition-colors duration-200"
                    style={{ minWidth: 40 }}
                    aria-label="Refresh"
                    type="button"
                    disabled={isRefreshingEvent}
                  >
                    <FaSyncAlt
                      className={isRefreshingEvent ? "animate-spin" : ""}
                    />
                  </button>
                </div>
              </div>
              <div className="min-w-[768px] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#eaeaea]">
                      <th className="first:rounded-tl-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        No
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Name
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Event
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Date
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Shift
                      </th>
                      <th className="first:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Status
                      </th>
                      <th className="first:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTableData(
                      eventData,
                      eventCurrentPage,
                      entriesPerPage,
                      eventSearchQuery
                    ).map((event, index) => (
                      <tr
                        key={event.id}
                        className={`border-b border-[#666666]/10 hover:bg-gray-100 cursor-pointer transition-colors duration-200`}
                        onClick={() => setSelectedRow(event.id)}
                        onMouseLeave={() => setSelectedRow(null)}
                      >
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {(eventCurrentPage - 1) * entriesPerPage + index + 1}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {event.full_name}
                          {(() => {
                            const groupMembers = [
                              event.group_member1,
                              event.group_member2,
                              event.group_member3,
                              event.group_member4,
                            ];
                            const groupCount = groupMembers.filter(
                              (m) => m && m.trim()
                            ).length;
                            return groupCount > 0 ? (
                              <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-medium text-gray-700 bg-gray-200 rounded-full align-middle">
                                +{groupCount}
                              </span>
                            ) : null;
                          })()}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {event.event_name}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {formatDate(event.event_date)}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {event.shift_name}
                        </td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] text-center">
                          {eventStatuses.find(
                            (status) => status.id === event.id
                          )?.status === "canceled" ? (
                            <span className="px-2 py-1 rounded-lg text-xs text-red-800 bg-red-100">
                              Canceled
                            </span>
                          ) : (
                            <select
                              value={
                                eventStatuses.find(
                                  (status) => status.id === event.id
                                )?.status || "not_attended"
                              }
                              onChange={(e) =>
                                handleEventStatusChange(
                                  event.id,
                                  e.target.value
                                )
                              }
                              className={`px-2 py-1 rounded-lg text-xs ${
                                eventStatuses.find(
                                  (status) => status.id === event.id
                                )?.status === "attended"
                                  ? "text-green-800 bg-green-100"
                                  : "text-yellow-800 bg-yellow-100"
                              }`}
                            >
                              <option
                                value="not_attended"
                                className="text-yellow-800 bg-white"
                              >
                                Not Attended
                              </option>
                              <option
                                value="attended"
                                className="text-green-800 bg-white"
                              >
                                Attended
                              </option>
                            </select>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] relative text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(
                                activeDropdown === event.id ? null : event.id
                              );
                            }}
                            className="text-[#666666] hover:text-[#111010] dropdown-trigger"
                          >
                            <FaEllipsisV size={14} />
                          </button>
                          {activeDropdown === event.id && (
                            <div
                              className="absolute right-0 w-36 bg-white rounded-lg shadow-lg border border-[#666666]/10 z-10 dropdown-menu"
                              style={{
                                top: selectedRow === event.id ? "auto" : "100%",
                                bottom:
                                  selectedRow === event.id ? "100%" : "auto",
                                transform:
                                  selectedRow === event.id
                                    ? "translateY(0)"
                                    : "translateY(-100%)",
                              }}
                            >
                              <button
                                className={`w-full text-left px-4 py-2 text-xs text-[#666666] hover:bg-gray-100 transition-colors duration-200 ${
                                  eventStatuses.find(
                                    (status) => status.id === event.id
                                  )?.status === "canceled"
                                    ? "rounded-lg"
                                    : "rounded-t-lg"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSessionId(event.id);
                                  setIsDetailModalOpen(true);
                                  setActiveDropdown(null);
                                }}
                              >
                                Detail
                              </button>
                              {eventStatuses.find(
                                (status) => status.id === event.id
                              )?.status !== "canceled" && (
                                <button
                                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-b-lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelClick(event.id);
                                    setActiveDropdown(null);
                                  }}
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={eventCurrentPage}
                setCurrentPage={setEventCurrentPage}
                data={eventData}
                itemsPerPage={entriesPerPage}
              />
            </>
          )}

          {activeTab === "membership" && (
            <>
              {/* Statistics Cards */}
              <div className="flex justify-center gap-4 mb-6">
                <div className="bg-white rounded-xl p-2 border border-[#666666]/50 w-[150px] text-center">
                  <p className="text-xs text-[#666666] font-['Poppins'] mb-1">
                    Total Member
                  </p>
                  <p className="text-sm font-medium text-[#111010] font-['Poppins']">
                    {membershipStats.totalMembers}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-2 border border-[#666666]/50 w-[150px] text-center">
                  <p className="text-xs text-[#666666] font-['Poppins'] mb-1">
                    Total Request
                  </p>
                  <p className="text-sm font-medium text-[#111010] font-['Poppins']">
                    {membershipStats.totalRequests}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-2 border border-[#666666]/50 w-[150px] text-center">
                  <p className="text-xs text-[#666666] font-['Poppins'] mb-1">
                    Total Revision
                  </p>
                  <p className="text-sm font-medium text-[#111010] font-['Poppins']">
                    {membershipStats.totalRevisions}
                  </p>
                </div>
              </div>

              {/* Search and Create Section */}
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name"
                    value={membershipSearchQuery}
                    onChange={(e) => handleSearch(e, setMembershipSearchQuery)}
                    className="w-[360px] h-[35px] rounded-2xl border border-[#666666]/30 pl-9 pr-4 text-xs font-normal font-['Poppins'] text-[#666666]"
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
                </div>
                {/* Refresh Button (all tabs) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchMembershipsTab}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#666666]/30 text-xs font-normal font-['Poppins'] text-[#2e3105] bg-white hover:bg-[#f2f2f2] transition-colors duration-200"
                    style={{ minWidth: 40 }}
                    aria-label="Refresh"
                    type="button"
                    disabled={isRefreshingMembership}
                  >
                    <FaSyncAlt
                      className={isRefreshingMembership ? "animate-spin" : ""}
                    />
                  </button>
                </div>
              </div>
              <div className="min-w-[768px] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#eaeaea]">
                      <th className="first:rounded-tl-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        No
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Name
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Email
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Phone
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Submitted At
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Status
                      </th>
                      <th className="first:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTableData(
                      membershipData,
                      currentPage,
                      entriesPerPage,
                      membershipSearchQuery
                    ).map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#666666]/10 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                        onClick={() => setSelectedRow(item.id)}
                        onMouseLeave={() => setSelectedRow(null)}
                      >
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {(currentPage - 1) * entriesPerPage + index + 1}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {item.full_name}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {item.email}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {item.phone_number}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins']">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] text-center">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs ${
                              item.status === "request"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.status === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : item.status === "verified"
                                ? "bg-green-100 text-green-800"
                                : item.status === "revision"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.status === "request"
                              ? "Pending Review"
                              : item.status === "processing"
                              ? "Under Review"
                              : item.status === "verified"
                              ? "Approved"
                              : item.status === "revision"
                              ? "Needs Revision"
                              : "Rejected"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs font-['Poppins'] text-center relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMembershipDetail(item.id);
                            }}
                            className="hover:bg-gray-100 p-2 rounded-full"
                          >
                            <FaEllipsisV className="text-[#666666]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                data={membershipData}
                itemsPerPage={entriesPerPage}
              />
            </>
          )}

          {activeTab === "borrowing" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or book title"
                    value={borrowingBookSearchQuery}
                    onChange={(e) =>
                      handleSearch(e, setBorrowingBookSearchQuery)
                    }
                    className="w-[360px] h-[35px] rounded-2xl border border-[#666666]/30 pl-9 pr-4 text-xs font-normal font-['Poppins'] text-[#666666]"
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
                </div>
                {/* Refresh Button (all tabs) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchBorrowing}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#666666]/30 text-xs font-normal font-['Poppins'] text-[#2e3105] bg-white hover:bg-[#f2f2f2] transition-colors duration-200"
                    style={{ minWidth: 40 }}
                    aria-label="Refresh"
                    type="button"
                    disabled={isRefreshingBorrowing}
                  >
                    <FaSyncAlt
                      className={isRefreshingBorrowing ? "animate-spin" : ""}
                    />
                  </button>
                </div>
              </div>
              <div className="min-w-[768px] overflow-x-auto">
                {getTableData(
                  borrowingBookData,
                  borrowingBookCurrentPage,
                  entriesPerPage,
                  borrowingBookSearchQuery
                ).length === 0 ? (
                  <div className="w-full text-center py-12 text-[#666666] text-sm font-['Poppins']">
                    No borrowing record available.
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#eaeaea]">
                        <th className="first:rounded-tl-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">No</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Name</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Book</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Phone Number</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Borrowing Date</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Return Date</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Status</th>
                        <th className="last:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getTableData(
                        borrowingBookData,
                        borrowingBookCurrentPage,
                        entriesPerPage,
                        borrowingBookSearchQuery
                      ).map((item, index) => {
                        const status = getBorrowingStatus(
                          item.loan_due,
                          item.status
                        );
                        return (
                          <tr
                            key={item.id}
                            className="border-b border-[#666666]/10 hover:bg-gray-100 transition-colors duration-200"
                          >
                            <td className="py-4 px-4 text-xs text-[#666666] font-['Poppins']">
                              {(borrowingBookCurrentPage - 1) * entriesPerPage +
                                index +
                                1}
                            </td>
                            <td className="py-4 px-4 text-xs text-[#666666] font-['Poppins']">
                              {item.full_name}
                            </td>
                            <td className="py-4 px-4 text-xs text-[#666666] font-['Poppins'] relative">
                              {item.book_title1}
                              {item.book_title2 && (
                                <span
                                  title="2 books total"
                                  className="ml-2 inline-block px-1.5 py-0.5 text-[9px] font-medium text-gray-700 bg-gray-200 rounded-full"
                                >
                                  +1
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-xs text-[#666666] font-['Poppins']">{item.phone_number}</td>
                            <td className="py-4 px-4 text-xs text-[#666666] font-['Poppins']">{formatDate(item.loan_start)}</td>
                            <td className="py-4 px-4 text-xs text-[#666666] font-['Poppins']">{formatDate(item.loan_due)}</td>
                            <td className="py-4 px-4 text-xs font-['Poppins'] text-center whitespace-nowrap min-w-[90px]">
                              <span
                                className={`px-2 py-1 rounded-lg text-xs whitespace-nowrap ${
                                  status === "returned"
                                    ? "text-green-800 bg-green-100"
                                    : status === "overdue"
                                    ? "text-red-800 bg-red-100"
                                    : "text-yellow-800 bg-yellow-100"
                                }`}
                              >
                                {status === "returned"
                                  ? "Returned"
                                  : status === "overdue"
                                  ? "Over Due"
                                  : "On Going"}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-xs font-['Poppins'] text-center relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdown(
                                    activeDropdown === item.id ? null : item.id
                                  );
                                }}
                                className="text-[#666666] hover:text-[#111010] dropdown-trigger"
                              >
                                <FaEllipsisV size={14} />
                              </button>

                              {activeDropdown === item.id && (
                                <div className="absolute right-0 w-36 bg-white rounded-lg shadow-lg border border-[#666666]/10 z-10 dropdown-menu">
                                  <button
                                    className="w-full text-left px-4 py-2 text-xs text-[#666666] hover:bg-gray-100 transition-colors duration-200 rounded-lg"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDetailBorrowing(item.id);
                                      setActiveDropdown(null);
                                    }}
                                  >
                                    Detail
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              {getTableData(
                borrowingBookData,
                borrowingBookCurrentPage,
                entriesPerPage,
                borrowingBookSearchQuery
              ).length > 0 && (
                <PaginationControls
                  currentPage={borrowingBookCurrentPage}
                  setCurrentPage={setBorrowingBookCurrentPage}
                  data={borrowingBookData}
                  itemsPerPage={entriesPerPage}
                />
              )}
            </>
          )}
        </div>
      </div>
      <CancelConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCancelConfirm}
        selectedBookingId={selectedBookingId}
      />
      <DetailSessionModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        sessionId={selectedSessionId}
        type={activeTab}
      />
      {/* Membership Detail Modal */}
      {isDetailMembershipModalOpen && (
        <DetailMembershipModal
          isOpen={isDetailMembershipModalOpen}
          onClose={(shouldRefresh) => {
            setIsDetailMembershipModalOpen(false);
            if (shouldRefresh) {
              // Refresh membership data if changes were made
              const fetchMemberships = async () => {
                try {
                  const response = await fetch("/api/memberships");
                  if (!response.ok) {
                    throw new Error("Failed to fetch memberships");
                  }
                  const data = await response.json();
                  setMembershipData(data.memberships);
                  setMembershipStats(data.stats);
                } catch (error) {
                  console.error("Error fetching memberships:", error);
                }
              };
              fetchMemberships();
            }
          }}
          membershipId={selectedMembershipId}
        />
      )}
      <DetailBorrowingModal
        isOpen={isDetailBorrowingModalOpen}
        onClose={() => setIsDetailBorrowingModalOpen(false)}
        borrowingData={selectedBorrowingData}
        onReturnBook={handleReturnBook}
      />
    </div>
  );
}
