"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiRefreshCw,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import AddBookModal from "./AddBookModal";
import DetailModal from "./DetailModal";
import AdjustCopiesModal from "./AdjustCopiesModal";
import RetireConfirmationModal from "./RetireConfirmationModal";
import { createClient } from "@/app/supabase/client";

const ManageBooks = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookStock, setBookStock] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const dropdownRef = useRef(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBookDetail, setSelectedBookDetail] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedBookAdjust, setSelectedBookAdjust] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);
  const [bookToRetire, setBookToRetire] = useState(null);

  // Fetch books from database
  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/manage-books");
      const data = await response.json();
      if (data.success) {
        setBooks(data.data);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Failed to fetch books");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (!openActionMenuId) return;
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenActionMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openActionMenuId]);

  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setBookStock(book.stock.toString());
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setBookStock("");
    setEditingBook(null);
  };

  const handleOpenDeleteModal = (book) => {
    setBookToDelete(book);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setBookToDelete(null);
  };

  const handleSubmit = async (formData) => {
    try {
      const result = await fetch(`/api/books/${editingBook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: parseInt(formData.get("stock")) }),
      });

      const response = await result.json();
      if (response.success) {
        handleCloseEditModal();
        await fetchBooks();
        router.refresh();
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        handleCloseDeleteModal();
        await fetchBooks();
        router.refresh();
      } else {
        console.error("Error:", result.error);
        setError(result.error || "Failed to delete book");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Failed to delete book");
    }
  };

  // Filter books based on search query
  const filteredBooks = books.filter((book) =>
    book.book_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredBooks.slice(startIndex, endIndex);
  };

  // Get total pages
  const totalPages = Math.ceil(filteredBooks.length / entriesPerPage);

  // Pagination Controls Component
  const PaginationControls = () => {
    return (
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-1">
          <span className="text-xs text-[#666666] font-['Poppins']">Show</span>
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
    );
  };

  const handleUpdateCopies = async ({ condition, comment }) => {
    if (!selectedBookAdjust) return;
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const staffId = session?.user?.id;
      if (!staffId) throw new Error("Staff ID not found in session");
      const res = await fetch(`/api/manage-books/${selectedBookAdjust.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition, comment, handle_by: staffId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdjustModalOpen(false);
        setSelectedBookAdjust(null);
        fetchBooks(); // refresh data
      } else {
        alert(data.error || "Failed to update condition");
      }
    } catch (err) {
      alert("Failed to update condition");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBooks();
    setIsRefreshing(false);
  };

  const handleRetire = async (id) => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const staffId = session?.user?.id;
      if (!staffId) throw new Error("Staff ID not found in session");
      const res = await fetch(`/api/manage-books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retire: true, handle_by: staffId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to retire book");
      setIsRetireModalOpen(false);
      setBookToRetire(null);
      await fetchBooks();
      router.refresh();
    } catch (error) {
      setError(error.message || "Failed to retire book");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
        <div className="max-w-[1440px] w-full mx-auto px-4 lg:px-12 py-6">
          {/* Search Bar Skeleton */}
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div className="w-[300px] sm:w-[400px] h-10 bg-gray-200 animate-pulse rounded-2xl"></div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-16 py-3 px-4">
                      <div className="h-6 bg-gray-300 animate-pulse rounded"></div>
                    </th>
                    <th className="py-3 px-4">
                      <div className="h-6 bg-gray-300 animate-pulse rounded"></div>
                    </th>
                    <th className="py-3 px-4">
                      <div className="h-6 bg-gray-300 animate-pulse rounded"></div>
                    </th>
                    <th className="py-3 px-4">
                      <div className="h-6 bg-gray-300 animate-pulse rounded"></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {[...Array(5)].map((_, index) => (
                    <tr key={index}>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-3">
                          <div className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
                          <div className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 right-0 px-4 py-3"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative mb-4">
        <div className="bg-gradient-to-l from-[#4d4d4d] to-black w-full h-[200px] flex items-center">
          <div className="max-w-[1440px] w-full mx-auto px-4 lg:px-8">
            <h1 className="text-[#fcfcfc] text-5xl font-medium leading-[48px] font-manrope">
              MANAGE BOOKS
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full h-full relative bg-white">
        <div className="max-w-[1440px] w-full mx-auto px-4 lg:px-12 py-6">
          {/* Search Bar & Add Button */}
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div className="relative w-[300px] sm:w-[400px]">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <FiSearch className="text-stone-500/50 w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search book"
                className="w-full h-10 pl-10 rounded-2xl border border-stone-300 text-xs font-normal font-['Poppins'] text-[#666666] focus:outline-none focus:border-lime-950"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#666666]/30 text-xs font-normal font-['Poppins'] text-[#2e3105] bg-white hover:bg-[#f2f2f2] transition-colors duration-200"
                style={{ minWidth: 40 }}
                aria-label="Refresh"
                type="button"
                disabled={isRefreshing}
              >
                <FiRefreshCw className={isRefreshing ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-lime-950 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-lime-900"
              >
                + Add Books
              </button>
            </div>
          </div>

          {/* Books Table */}
          <div className="min-w-[768px] overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#eaeaea]">
                  <th className="first:rounded-tl-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    No
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Book Title
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Condition
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Comment
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Status
                  </th>
                  <th className="first:rounded-tr-xl text-center py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {getPaginatedData().map((book, index) => (
                  <tr
                    key={book.id}
                    className="border-b border-[#666666]/10 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                  >
                    <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] text-center">
                      {(currentPage - 1) * entriesPerPage + index + 1}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] text-left">
                      {book.book_title}
                      {book.copy ? ` (copy ${book.copy})` : ""}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] text-center">
                      {(() => {
                        const condition = (book.condition || "").toLowerCase();
                        let badgeClass =
                          "px-2 py-1 rounded-lg text-xs font-medium ";
                        let label = book.condition || "-";
                        if (
                          condition === "not specified" ||
                          condition === "not_specified"
                        ) {
                          badgeClass += "bg-yellow-100 text-yellow-800";
                        } else if (condition === "pristine") {
                          badgeClass += "bg-green-100 text-green-800";
                        } else if (condition === "good") {
                          badgeClass += "bg-blue-100 text-blue-800";
                        } else if (condition === "fair") {
                          badgeClass += "bg-orange-100 text-orange-800";
                        } else if (condition === "poor") {
                          badgeClass += "bg-red-200 text-red-800";
                        } else {
                          badgeClass += "text-[#666666]";
                        }
                        return <span className={badgeClass}>{label}</span>;
                      })()}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] text-center">
                      {book.comment ? book.comment : "-"}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#666666] font-['Poppins'] text-center">
                      {(() => {
                        let badgeClass =
                          "px-2 py-1 rounded-lg text-xs font-medium ";
                        let label = book.dynamic_status || "-";
                        if (label === "Available") {
                          badgeClass += "bg-green-100 text-green-800";
                        } else if (label === "On Loan") {
                          badgeClass += "bg-blue-100 text-blue-800";
                        } else if (label === "Retired") {
                          badgeClass += "bg-gray-200 text-gray-800";
                        } else {
                          badgeClass += "bg-yellow-100 text-yellow-800";
                        }
                        return <span className={badgeClass}>{label}</span>;
                      })()}
                    </td>
                    <td className="py-3 px-4 text-xs font-['Poppins'] text-center relative">
                      <button
                        onClick={() =>
                          setOpenActionMenuId(
                            openActionMenuId === book.id ? null : book.id
                          )
                        }
                        className="hover:bg-gray-100 p-2 rounded-full dropdown-trigger"
                      >
                        <FiMoreVertical className="text-[#666666]" />
                      </button>
                      {openActionMenuId === book.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-36 bg-white rounded-lg shadow-lg border border-[#666666]/10 z-10 dropdown-menu"
                        >
                          {book.dynamic_status === "Retired" ? (
                            <button
                              className="w-full text-left px-4 py-2 text-xs text-[#666666] hover:bg-gray-100 transition-colors duration-200 rounded-lg"
                              type="button"
                              onClick={() => {
                                setSelectedBookDetail(book);
                                setIsDetailModalOpen(true);
                                setOpenActionMenuId(null);
                              }}
                            >
                              Detail
                            </button>
                          ) : (
                            <>
                              <button
                                className="w-full text-left px-4 py-2 text-xs text-[#666666] hover:bg-gray-100 transition-colors duration-200 rounded-t-lg"
                                type="button"
                                onClick={() => {
                                  setSelectedBookAdjust(book);
                                  setIsAdjustModalOpen(true);
                                  setOpenActionMenuId(null);
                                }}
                              >
                                Adjust Condition
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-xs text-[#666666] hover:bg-gray-100 transition-colors duration-200"
                                type="button"
                                onClick={() => {
                                  setSelectedBookDetail(book);
                                  setIsDetailModalOpen(true);
                                  setOpenActionMenuId(null);
                                }}
                              >
                                Detail
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-b-lg"
                                type="button"
                                onClick={() => {
                                  setBookToRetire(book);
                                  setIsRetireModalOpen(true);
                                  setOpenActionMenuId(null);
                                }}
                              >
                                Retire Book
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <PaginationControls />

          {/* Modal Edit Stock */}
          {isEditModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-[400px]">
                <h2 className="text-xl font-semibold mb-4 text-gray-500">
                  Edit Book Stock
                </h2>
                <form action={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Title
                    </label>
                    <p className="text-gray-600">{editingBook?.book_title}</p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      min="0"
                      placeholder="Enter stock quantity"
                      className="w-full h-10 px-4 bg-zinc-100 rounded-lg border border-stone-300 text-sm font-medium text-gray-900 focus:outline-none focus:border-lime-950"
                      value={bookStock}
                      onChange={(e) => setBookStock(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseEditModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-lime-950 text-white rounded-lg text-sm font-medium hover:bg-lime-900"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Delete Confirmation */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-[400px]">
                <h2 className="text-xl font-semibold mb-4 text-gray-500">
                  Delete Confirmation
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{bookToDelete?.book_title}"
                  from inventory?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCloseDeleteModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(bookToDelete?.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Add Book */}
          {isAddModalOpen && (
            <AddBookModal onClose={() => setIsAddModalOpen(false)} />
          )}

          {/* Detail Modal */}
          <DetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            book={selectedBookDetail}
          />

          {/* Adjust Copies Modal */}
          <AdjustCopiesModal
            isOpen={isAdjustModalOpen}
            onClose={() => setIsAdjustModalOpen(false)}
            book={selectedBookAdjust}
            onUpdate={handleUpdateCopies}
          />

          {/* Retire Confirmation Modal */}
          <RetireConfirmationModal
            isOpen={isRetireModalOpen}
            onClose={() => setIsRetireModalOpen(false)}
            onRetire={() => handleRetire(bookToRetire?.id)}
            item={bookToRetire}
          />
        </div>
      </div>
    </div>
  );
};

export default ManageBooks;
