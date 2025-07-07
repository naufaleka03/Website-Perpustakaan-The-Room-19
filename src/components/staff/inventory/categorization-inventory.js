"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/lib/actions";
import { useRouter } from "next/navigation";

const CategorizationInventory = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.category_name);
    } else {
      setEditingCategory(null);
      setCategoryName("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoryName("");
    setEditingCategory(null);
  };

  const handleOpenDeleteModal = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleSubmit = async (formData) => {
    try {
      let result;
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, formData);
        if (result.success) {
          handleCloseModal();
          await fetchCategories();
          router.refresh();
        } else {
          setError(result.error);
        }
      } else {
        result = await createCategory(formData);
        if (result.success) {
          handleCloseModal();
          await fetchCategories();
          router.refresh();
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Check if category has items
      const categoryToDelete = categories.find((c) => c.id === id);
      if (parseInt(categoryToDelete.number_of_items) > 0) {
        setError(
          "Cannot delete category that contains items. Please remove or reassign all items first."
        );
        handleCloseDeleteModal();
        return;
      }

      await deleteCategory(id);
      handleCloseDeleteModal();
      await fetchCategories();
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.category_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredCategories.slice(startIndex, endIndex);
  };

  // Get total pages
  const totalPages = Math.ceil(filteredCategories.length / entriesPerPage);

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

  if (isLoading) {
    return (
      <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
        <div className="max-w-[1440px] w-full mx-auto px-4 lg:px-12 py-6">
          {/* Search and Add Button Skeleton */}
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div className="w-[300px] sm:w-[400px] h-10 bg-gray-200 animate-pulse rounded-2xl"></div>
            <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg mt-4 sm:mt-0"></div>
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
              INVENTORY CATEGORIZATION
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full h-full relative bg-white">
        <div className="max-w-[1440px] w-full mx-auto px-4 lg:px-12 py-6">
          {/* Search Bar and Add Category Button Container */}
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div className="relative w-[300px] sm:w-[400px]">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <FiSearch className="text-stone-500/50 w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search category"
                className="w-full h-10 pl-10 rounded-2xl border border-stone-300 text-xs font-normal font-['Poppins'] text-[#666666] focus:outline-none focus:border-lime-950"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 h-10 bg-lime-950 text-white rounded-lg text-xs font-normal font-['Poppins'] hover:bg-lime-900 transition-colors mt-4 sm:mt-0"
            >
              <FiPlus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {/* Category Table */}
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#eaeaea]">
                  <th className="py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    No
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap text-left">
                    Category Name
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Total Items
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getPaginatedData().map((category, index) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="text-center py-4 px-4 text-xs text-[#666666] font-['Poppins']">
                      {(currentPage - 1) * entriesPerPage + index + 1}
                    </td>
                    <td className="text-left py-4 px-4 text-xs text-[#666666] font-['Poppins']">
                      {category.category_name}
                    </td>
                    <td className="text-center py-4 px-4 text-xs text-[#666666] font-['Poppins']">
                      {parseInt(category.number_of_items)}
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-medium">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(category)}
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

          {/* Pagination Controls */}
          <PaginationControls />

          {/* Modal Add/Edit Category */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-[400px]">
                <h2 className="text-xl font-semibold mb-4 text-gray-500">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <form action={handleSubmit}>
                  <input
                    type="text"
                    name="category_name"
                    placeholder="Enter category name"
                    className="w-full h-10 px-4 bg-zinc-100 rounded-lg border border-stone-300 text-sm font-medium text-gray-900 focus:outline-none focus:border-lime-950 mb-4"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-lime-950 text-white rounded-lg text-sm font-medium hover:bg-lime-900"
                    >
                      {editingCategory ? "Update" : "Submit"}
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
                  Are you sure you want to delete the "
                  {categoryToDelete?.category_name}" category?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCloseDeleteModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(categoryToDelete?.id)}
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

export default CategorizationInventory;
