"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const GenreSettings = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [genreName, setGenreName] = useState("");
  const [editingGenre, setEditingGenre] = useState(null);
  const [genreToDelete, setGenreToDelete] = useState(null);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch genres from database
  const fetchGenres = async () => {
    try {
      const response = await fetch('/api/genres');
      const data = await response.json();
      if (data.success) {
        setGenres(data.data);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch genres');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleOpenModal = (genre = null) => {
    if (genre) {
      setEditingGenre(genre);
      setGenreName(genre.genre_name);
    } else {
      setEditingGenre(null);
      setGenreName("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setGenreName("");
    setEditingGenre(null);
  };

  const handleOpenDeleteModal = (genre) => {
    setGenreToDelete(genre);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setGenreToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { genre_name: genreName };
    try {
      let result, data;
      if (editingGenre) {
        result = await fetch(`/api/genres/${editingGenre.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        data = await result.json();
        if (data.success) {
          handleCloseModal();
          await fetchGenres();
          router.refresh();
        } else {
          setError(data.error);
        }
      } else {
        result = await fetch('/api/genres', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        data = await result.json();
        if (data.success) {
          handleCloseModal();
          await fetchGenres();
          router.refresh();
        } else {
          setError(data.error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await fetch(`/api/genres/${id}`, {
        method: 'DELETE',
      });
      const data = await result.json();
      if (data.success) {
        handleCloseDeleteModal();
        await fetchGenres();
        router.refresh();
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const filteredGenres = genres.filter((genre) =>
    genre.genre_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    return <div className="flex-1 flex items-center justify-center text-red-600">{error}</div>;
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
              CATEGORIZATION
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full h-full relative bg-white">
        <div className="max-w-[1440px] w-full mx-auto px-4 lg:px-12 py-6">
          {/* Search Bar and Add Genre Button Container */}
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div className="relative w-[300px] sm:w-[400px]">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <FiSearch className="text-stone-500/50 w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search genre"
                className="w-full h-10 pl-10 rounded-2xl border border-stone-300 text-xs font-normal font-['Poppins'] text-[#666666] focus:outline-none focus:border-lime-950"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-[#111010] text-white rounded-xl text-xs font-['Poppins'] transition-colors duration-200 hover:bg-[#232323] mt-4 sm:mt-0"
            >
              <FaPlus size={12} />
              Add Genre
            </button>
          </div>

          {/* Genre Table */}
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#eaeaea]">
                  <th className="py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">No</th>
                  <th className="py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Genre Name</th>
                  <th className="py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Total Books</th>
                  <th className="py-3 px-4 text-xs font-medium text-[#666666] font-['Poppins'] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGenres.map((genre, index) => (
                  <tr key={genre.id} className="hover:bg-gray-50">
                    <td className="text-center py-4 px-4 text-xs text-[#666666] font-['Poppins']">{index + 1}</td>
                    <td className="text-center py-4 px-4 text-xs text-[#666666] font-['Poppins']">{genre.genre_name}</td>
                    <td className="text-center py-4 px-4 text-xs text-[#666666] font-['Poppins']">{genre.number_of_books}</td>
                    <td className="py-4 px-6 text-center text-sm font-medium">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          onClick={() => handleOpenModal(genre)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(genre)}
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

          {/* Modal Add/Edit Genre */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-[400px]">
                <h2 className="text-xl font-semibold mb-4 text-gray-500">
                  {editingGenre ? "Edit Genre" : "Add New Genre"}
                </h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="genre_name"
                    placeholder="Enter genre name"
                    className="w-full h-10 px-4 bg-zinc-100 rounded-lg border border-stone-300 text-sm font-medium text-gray-900 focus:outline-none focus:border-lime-950 mb-4"
                    value={genreName}
                    onChange={(e) => setGenreName(e.target.value)}
                    required
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#2e3105] text-white rounded-lg text-sm hover:bg-[#404615]"
                    >
                      {editingGenre ? "Update" : "Submit"}
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
                <h2 className="text-xl font-semibold mb-4 text-gray-500">Delete Confirmation</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the "{genreToDelete?.genre_name}" genre?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCloseDeleteModal}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(genreToDelete?.id)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
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

export default GenreSettings;
