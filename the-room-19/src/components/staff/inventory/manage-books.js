"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import { updateBookStock, deleteBook } from "@/app/lib/actions";
import { useRouter } from "next/navigation";

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

  // Fetch books from database
  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/books");
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
      const result = await updateBookStock(editingBook.id, formData);
      if (result.success) {
        handleCloseEditModal();
        await fetchBooks();
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBook(id);
      handleCloseDeleteModal();
      await fetchBooks();
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  const filteredBooks = books.filter((book) =>
    book.book_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {/* Search Bar Container */}
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
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Books Table */}
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#eaeaea]">
                  <th className="py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    No
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap text-left">
                    Book Title
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Stock
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.map((book, index) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="text-center py-4 px-4 text-xs text-[#666666] font-['Poppins']">
                      {index + 1}
                    </td>
                    <td className="text-left py-4 px-4 text-xs text-[#666666] font-['Poppins']">
                      {book.book_title}
                    </td>
                    <td className="text-center py-4 px-4 text-xs text-[#666666] font-['Poppins']">
                      {book.stock}
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-medium">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          onClick={() => handleOpenEditModal(book)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(book)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default ManageBooks;
