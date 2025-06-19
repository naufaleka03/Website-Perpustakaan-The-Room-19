import React, { useEffect, useState } from "react";
import Select from "react-select/async";

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    fontWeight: 400,
    color: "#222",
    fontFamily: "Poppins, sans-serif",
    fontSize: "0.75rem",
    backgroundColor: state.isSelected
      ? "#eaeaea"
      : state.isFocused
      ? "#f3f3f3"
      : "#fff",
  }),
  singleValue: (provided) => ({
    ...provided,
    fontWeight: 400,
    color: "#222",
    fontFamily: "Poppins, sans-serif",
    fontSize: "0.75rem",
  }),
};

const fetchBooks = async (inputValue) => {
  const params = new URLSearchParams();
  params.append("limit", "50");
  if (inputValue) {
    params.append("search", inputValue);
  }
  const res = await fetch(`/api/books?${params.toString()}`);
  const data = await res.json();
  if (data.books) {
    return data.books.map((book) => ({
      value: book.id,
      label: book.book_title,
    }));
  }
  return [];
};

const AddBookModal = ({ onClose }) => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [copies, setCopies] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Default options: fetch 50 buku pertama saat modal dibuka
  const [defaultOptions, setDefaultOptions] = useState([]);
  useEffect(() => {
    fetchBooks("")
      .then(setDefaultOptions)
      .catch(() => setDefaultOptions([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!selectedBook || !copies || copies < 1) {
      setError("Please select a book and enter a valid number of copies.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/manage-books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: selectedBook.value,
          copies: Number(copies),
        }),
      });
      const data = await res.json();
      if (data.success) {
        onClose();
        // (Opsional) bisa trigger refresh parent di sini
      } else {
        setError(data.error || "Failed to add book");
      }
    } catch (err) {
      setError("Failed to add book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[400px]">
        <h2 className="text-xl font-semibold mb-4 text-gray-500">
          Add New Book
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Dropdown Book Catalog with Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book Catalog
            </label>
            <Select
              cacheOptions
              defaultOptions={defaultOptions}
              loadOptions={fetchBooks}
              placeholder="Search book title"
              isSearchable
              value={selectedBook}
              onChange={setSelectedBook}
              className="react-select-container"
              classNamePrefix="react-select"
              noOptionsMessage={() => "No books found"}
              styles={customStyles}
              isDisabled={loading}
            />
            {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copies
            </label>
            <input
              type="number"
              min={1}
              value={copies}
              onChange={(e) => setCopies(e.target.value)}
              className="w-full h-10 px-4 bg-zinc-100 rounded-lg border border-stone-300 text-sm font-medium text-gray-900 focus:outline-none focus:border-lime-950"
              placeholder="Enter number of copies"
              disabled={loading}
            />
          </div>
          {/* Tombol aksi */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-lime-950 text-white rounded-lg text-sm font-medium hover:bg-lime-900"
              disabled={loading || !selectedBook || !copies || copies < 1}
            >
              {loading ? "Adding..." : "Add Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;
