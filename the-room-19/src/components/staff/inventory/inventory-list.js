"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiMoreVertical } from "react-icons/fi";
import { useRouter } from "next/navigation";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ItemDetailModal from "./ItemDetailModal";
import AdjustStockModal from "./AdjustStockModal";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function InventoryList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  const [detailModal, setDetailModal] = useState({ isOpen: false, item: null });
  const [adjustStockModal, setAdjustStockModal] = useState({
    isOpen: false,
    item: null,
  });
  const itemsPerPage = 16;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch inventory items
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch("/api/inventory");
        const data = await response.json();
        if (data.success) {
          setInventory(data.data);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError("Failed to fetch inventory items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Filter inventory based on search
  const filteredInventory = inventory.filter((item) =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredInventory.slice(startIndex, endIndex);
  };

  // Get total pages
  const totalPages = Math.max(
    1,
    Math.ceil(filteredInventory.length / itemsPerPage)
  );

  // Pagination Controls Component
  const PaginationControls = () => {
    return (
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`p-2 rounded-full bg-white border ${
            currentPage === 1
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FaChevronLeft className="text-lg" />
        </button>
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          <span>Page</span>
          <span className="text-gray-900">{currentPage}</span>
          <span>of</span>
          <span className="text-gray-900">{totalPages}</span>
        </div>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`p-2 rounded-full bg-white border ${
            currentPage === totalPages
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FaChevronRight className="text-lg" />
        </button>
      </div>
    );
  };

  const handleMoreOptions = (e, itemId) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setInventory(inventory.filter((i) => i.id !== item.id));
        setDeleteModal({ isOpen: false, item: null });
      } else {
        setError(data.error || "Failed to delete item");
      }
    } catch (error) {
      setError("An error occurred while deleting the item");
    }
  };

  const handleAction = (action, item) => {
    setActiveDropdown(null);
    switch (action) {
      case "detail":
        setDetailModal({ isOpen: true, item });
        break;
      case "update":
        router.push(`/staff/dashboard/inventory/update-item?id=${item.id}`);
        break;
      case "adjust-stock":
        setAdjustStockModal({ isOpen: true, item });
        break;
      case "delete":
        setDeleteModal({ isOpen: true, item });
        break;
      default:
        break;
    }
  };

  const handleStockAdjustment = async (newQuantity) => {
    try {
      const response = await fetch(
        `/api/inventory/${adjustStockModal.item.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock_quantity: newQuantity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update stock");
      }

      // Update the local state to reflect the change
      setInventory(
        inventory.map((item) =>
          item.id === adjustStockModal.item.id
            ? { ...item, stock_quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating stock:", error);
      // You might want to show an error message to the user here
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-white p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
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
    <div className="flex-1 min-h-screen bg-white">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        item={deleteModal.item}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={handleDelete}
      />

      {/* Item Detail Modal */}
      <ItemDetailModal
        isOpen={detailModal.isOpen}
        item={detailModal.item}
        onClose={() => setDetailModal({ isOpen: false, item: null })}
      />

      {/* Adjust Stock Modal */}
      <AdjustStockModal
        isOpen={adjustStockModal.isOpen}
        item={adjustStockModal.item}
        onClose={() => setAdjustStockModal({ isOpen: false, item: null })}
        onConfirm={handleStockAdjustment}
      />

      {/* Top Search Bar */}
      <div className="max-w-[1440px] mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div className="relative flex-1 max-w-[800px] mx-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pl-10 rounded-2xl border border-[#666666]/30 text-sm font-['Poppins'] text-[#666666]"
            />
          </div>
          <button
            onClick={() =>
              router.push("/staff/dashboard/inventory/create-item")
            }
            className="ml-4 px-4 py-2 bg-[#3F4B2C] text-white rounded-lg text-sm font-['Poppins']"
          >
            Add Item
          </button>
        </div>

        {/* Main Content */}
        <div className="w-full">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          {filteredInventory.length === 0 ? (
            <div className="text-center py-12 text-[#666666]">
              No items available. Add a new item to get started!{" "}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
                {getPaginatedData().map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#F6F6F6] rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative w-full max-w-[300px] mx-auto border border-[#CDCDCD]"
                  >
                    {/* More Options Button */}
                    <div className="absolute top-2 right-2 z-10 dropdown-container">
                      <button
                        onClick={(e) => handleMoreOptions(e, item.id)}
                        className="p-1 hover:bg-black/10 rounded-full transition-colors"
                      >
                        <FiMoreVertical className="w-5 h-5 text-black" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === item.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => handleAction("detail", item)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => handleAction("update", item)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleAction("adjust-stock", item)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700"
                          >
                            Adjust Stock
                          </button>
                          <button
                            onClick={() => handleAction("delete", item)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="aspect-square relative">
                      <img
                        src={
                          item.item_image || "https://via.placeholder.com/300"
                        }
                        alt={item.item_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-[#111010] mb-1 line-clamp-1">
                        {item.item_name}
                      </h3>
                      <p className="text-xs text-[#666666] mb-2 line-clamp-1">
                        {item.description}
                      </p>
                      <div className="flex justify-end items-center">
                        <span className="text-xs text-[#666666]">
                          Stock: {item.stock_quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination - always show */}
              <PaginationControls />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
