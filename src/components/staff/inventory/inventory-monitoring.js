"use client";
import { useState, useEffect } from "react";
import React from "react";
import InventoryLogDetailModal from "./InventoryLogDetailModal";
import { FaEllipsisV } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function InventoryMonitoring() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [detailModal, setDetailModal] = useState({ isOpen: false, log: null });
  const [selectedRow, setSelectedRow] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Move fetchLogs outside useEffect
  const fetchLogs = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const res = await fetch("/api/inventory/monitoring");
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      } else {
        setError(data.error || "Failed to fetch inventory logs");
      }
    } catch (err) {
      setError("Failed to fetch inventory logs");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter data by search
  const filteredData = logs.filter(
    (item) =>
      (item.item_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (item.category_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (item.comment || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".dropdown-trigger") &&
        !event.target.closest(".dropdown-menu")
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#232310] to-[#5f5f2c]">
        {/* Hero Section Skeleton */}
        <div className="relative mb-8 mt-0">
          <div className="w-full h-[360px] relative bg-gradient-to-br from-[#232310] to-[#5f5f2c]">
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#232310] pointer-events-none"></div>
            <div className="absolute inset-x-0 top-0 flex items-start w-full mx-auto px-4 lg:px-8 pt-16">
              <div className="max-w-[1200px] mx-auto w-full">
                <div className="h-10 w-2/3 bg-gray-300/60 rounded mb-4 animate-pulse"></div>
                <div className="h-6 w-1/2 bg-gray-300/40 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Card Overlay Skeleton */}
        <div className="relative z-10 max-w-[1200px] mx-auto px-2 lg:px-6 pb-24" style={{ marginTop: '-180px' }}>
          <div className="bg-white rounded-xl shadow-md p-8">
            {/* Search Bar Skeleton */}
            <div className="flex justify-between items-center mb-6">
              <div className="w-[360px] h-9 bg-gray-200 animate-pulse rounded-2xl"></div>
              <div className="w-20 h-9 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
            {/* Table Skeleton (8 columns) */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      {[...Array(8)].map((_, i) => (
                        <th key={i} className="py-3 px-4"><div className="h-6 w-20 bg-gray-300 animate-pulse rounded"></div></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, rowIdx) => (
                      <tr key={rowIdx}>
                        {[...Array(8)].map((_, colIdx) => (
                          <td key={colIdx} className="py-4 px-4"><div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#232310] to-[#5f5f2c]">
      {/* Hero Section */}
      <div className="relative mb-8 mt-0">
        <div className="w-full h-[360px] relative bg-gradient-to-br from-[#232310] to-[#5f5f2c]">
          <img src="/navigation/inventory.jpg" alt="Inventory Monitoring Hero" className="w-full h-full object-cover rounded-none" />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#232310] pointer-events-none"></div>
          <div className="absolute inset-x-0 top-0 flex items-start w-full mx-auto px-4 lg:px-8 pt-16">
            <div className="max-w-[1200px] mx-auto w-full">
              <h1 className="text-[#fcfcfc] text-4xl font-medium leading-[44px] font-manrope">
                INVENTORY TRANSACTIONS
              </h1>
              <p className="text-[#fcfcfc]/80 max-w-xl font-manrope">
                Track and review all inventory changes and stock movements for The Room 19 Library.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Overlay Content Section */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-2 lg:px-6 pb-24" style={{ marginTop: '-180px' }}>
        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Search Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-[360px]">
              <input
                type="text"
                placeholder="Search by item name"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-[35px] rounded-2xl border border-[#666666]/30 pl-9 pr-4 text-xs font-normal font-['Poppins'] text-[#666666]"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="#666"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6Z"
                  />
                </svg>
              </span>
            </div>
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#666666]/30 text-xs font-normal font-['Poppins'] text-[#2e3105] bg-white hover:bg-[#f2f2f2] transition-colors duration-200"
              style={{ minWidth: 40 }}
              aria-label="Refresh"
              type="button"
              disabled={isRefreshing}
            >
              <FiRefreshCw className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Table */}
          <div className="min-w-[768px] overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#eaeaea]">
                  <th className="first:rounded-tl-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    No
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Item
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Date
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Category
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Action
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Stock Before
                  </th>
                  <th className="last:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Stock After
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-8 text-[#666666] text-sm"
                    >
                      No data found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#666666]/10 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                      onMouseEnter={() => setSelectedRow(item.id)}
                      onMouseLeave={() => setSelectedRow(null)}
                    >
                      <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] text-center">
                        {startIndex + idx + 1}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#111010] font-['Poppins'] text-center">
                        {item.item_name}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] text-center">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] text-center">
                        {item.category_name}
                      </td>
                      <td className="py-3 px-4 text-xs font-['Poppins'] text-center">
                        {item.mode === "add" ? (
                          <span className="text-green-600 text-lg font-bold">
                            +
                          </span>
                        ) : (
                          <span className="text-red-600 text-lg font-bold">
                            -
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#111010] font-['Poppins'] font-semibold text-center">
                        {item.stock_before}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#111010] font-['Poppins'] font-semibold text-center">
                        {item.stock_after}
                      </td>
                      <td className="py-3 px-4 text-xs font-['Poppins'] relative text-center">
                        <button
                          className="hover:bg-gray-100 p-2 rounded-full dropdown-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(
                              activeDropdown === item.id ? null : item.id
                            );
                          }}
                          aria-label="More options"
                        >
                          <FaEllipsisV size={14} className="text-[#666666]" />
                        </button>
                        {activeDropdown === item.id && (
                          <div
                            className="absolute right-0 w-28 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 dropdown-menu"
                            style={{
                              top: selectedRow === item.id ? "auto" : "100%",
                              bottom: selectedRow === item.id ? "100%" : "auto",
                              transform:
                                selectedRow === item.id
                                  ? "translateY(0)"
                                  : "translateY(-100%)",
                            }}
                          >
                            <button
                              className="w-full px-4 py-2 text-left text-xs hover:bg-gray-100 text-gray-700 rounded-lg"
                              onClick={() => {
                                setActiveDropdown(null);
                                setTimeout(
                                  () =>
                                    setDetailModal({ isOpen: true, log: item }),
                                  0
                                );
                              }}
                            >
                              Detail
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#666666] font-['Poppins']">
                Show
              </span>
              <select
                value={entriesPerPage}
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
        </div>
      </div>

      {/* Detail Modal */}
      <InventoryLogDetailModal
        isOpen={detailModal.isOpen}
        log={detailModal.log}
        onClose={() => setDetailModal({ isOpen: false, log: null })}
      />
    </div>
  );
}
