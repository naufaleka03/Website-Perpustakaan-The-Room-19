"use client";

import { useState, useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import { IoChevronBackOutline, IoChevronForwardOutline, IoClose } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import Link from "next/link";

// Genres list
const allGenres = [
  "Arts & Architecture",
  "Business",
  "Children's Books",
  "Crime & Mystery",
  "Fantasy & Sci-Fi",
  "Historical Fiction",
  "Psychology & Self Help",
  "Romance",
  "Science",
  // ... rest of the genres
];

// Book Card Component
const BookCard = ({ id, title, author, imageUrl, rating }) => {
  // Convert rating to a number and default to 0 if it's null/undefined
  const numericRating = typeof rating === 'number' ? rating : 0;
  
  // Function to generate initials from title
  const getBookInitials = (title) => {
    if (!title) return "";
    return title
      .split(" ")
      .map(word => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };
  
  return (
    <Link href={`/staff/dashboard/book-management/detail?id=${id}`}>
      <div className="relative cursor-pointer">
        <div className="w-full aspect-[180/250] rounded-2xl border border-[#cdcdcd] overflow-hidden">
          {imageUrl ? (
            <img
              className="w-full h-full object-cover"
              src={imageUrl}
              alt={`${title} Cover`}
              onError={(e) => {
                console.error(`Error loading image for book ${id}:`, e);
                e.target.src = "https://placehold.co/219x312";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500">
              {getBookInitials(title)}
            </div>
          )}
        </div>
        <h3 className="text-center text-black text-xs font-bold font-manrope mt-1 line-clamp-1">
          {title}
        </h3>
        <p className="text-center text-[#b5b3b3] text-xs font-semibold font-manrope">
          {author}
        </p>
        <div className="flex justify-center items-center mt-1">
          <AiFillStar className="text-[#ECB43C] text-sm" />
          <span className="text-[#666666] text-xs ml-1">{numericRating.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <>
    {[...Array(8)].map((_, index) => (
      <div key={index} className="animate-pulse">
        <div className="aspect-[180/250] rounded-2xl border border-[#cdcdcd] bg-gray-200"></div>
        <div className="h-3 bg-gray-200 rounded mt-2 w-3/4 mx-auto"></div>
        <div className="h-2 bg-gray-200 rounded mt-2 w-1/2 mx-auto"></div>
        <div className="flex justify-center items-center mt-2">
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    ))}
  </>
);

// Simpler GenreSelectModal without external dependencies
const GenreSelectModal = ({ isOpen, onClose, genres = [], selectedGenres = [], onChange, title = "Select Genres" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGenres, setFilteredGenres] = useState(genres);
  const [localSelected, setLocalSelected] = useState([...selectedGenres]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Reset filtered genres when genres prop changes
  useEffect(() => {
    setFilteredGenres(genres);
  }, [genres]);

  // Update local selection when selectedGenres prop changes
  useEffect(() => {
    setLocalSelected([...selectedGenres]);
  }, [selectedGenres]);

  // Filter genres based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGenres(genres);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = genres.filter(genre => 
      genre.toLowerCase().includes(query)
    );
    setFilteredGenres(filtered);
  }, [searchQuery, genres]);

  const handleGenreToggle = (genre) => {
    setLocalSelected(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
    } else {
        return [...prev, genre];
    }
    });
  };

  const handleClearAll = () => {
    setLocalSelected([]);
  };

  const handleApply = () => {
    onChange(localSelected);
    onClose();
  };
  
  // Stop propagation on modal content click to prevent closing
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={handleModalContentClick}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-medium text-gray-900">
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <IoClose size={24} />
          </button>
        </div>

        {/* Search Box */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search genres"
              className="w-full h-[38px] bg-[#f2f2f2] rounded-2xl border border-[#cdcdcd] pl-10 pr-4 text-xs text-gray-400"
            />
            <BiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* Genres List */}
        <div className="max-h-[350px] overflow-y-auto p-4">
          {filteredGenres.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              No genres found.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredGenres.map((genre) => (
                <label
                  key={genre}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={localSelected.includes(genre)}
                    onChange={() => handleGenreToggle(genre)}
                    className="w-4 h-4 rounded-sm border-[#cdcdcd]"
                    style={{ accentColor: "#2e3105" }}
                  />
                  <span className="text-black text-xs font-medium truncate">
                    {genre}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center border-t p-4">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 border border-[#2e3105] text-[#2e3105] text-xs rounded-2xl"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-[#2e3105] text-white text-xs rounded-2xl"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

const CatalogStaff = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedBookTypes, setSelectedBookTypes] = useState([]);
  const [genres, setGenres] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const booksPerPage = 12;
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);

  // Fetch all genres from database
  const fetchGenres = async () => {
    try {
      const response = await fetch('/api/genres');
      const data = await response.json();
      if (data.success) {
        setGenres(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch genres', error);
    }
  };

  // Fetch books with pagination
  const fetchBooks = async () => {
    try {
      setLoading(true);
      // Build the query parameters
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (selectedGenres.length === 1) {
        params.append('genre', selectedGenres[0]);
      }
      
      if (selectedBookTypes.length === 1) {
        params.append('bookType', selectedBookTypes[0]);
      }
      
      params.append('page', currentPage);
      params.append('limit', booksPerPage);
      
      const response = await fetch(`/api/books?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const data = await response.json();
      setBooks(data.books || []);
      setTotalPages(Math.ceil((data.total || 0) / booksPerPage));
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchGenres();
  }, []);

  // Fetch books when filters change
  useEffect(() => {
    fetchBooks();
  }, [searchQuery, selectedGenres, selectedBookTypes, currentPage]);

  // Refetch genres and books when navigating back to the page
  useEffect(() => {
    const handleFocus = () => {
      fetchGenres();
      fetchBooks();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleGenreChange = (genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleBookTypeChange = (type) => {
    setSelectedBookTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
      <div className="w-full h-full relative bg-white">
        <div className="w-full mx-auto px-12 py-8">
          {/* Search Bar and Add Book Button */}
          <div className="flex justify-center items-center mb-6">
            <div className="w-[600px] flex items-center gap-3">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="w-full h-[38px] bg-[#f2f2f2] rounded-2xl border border-[#cdcdcd] flex items-center px-5">
                  <BiSearch className="text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="ml-2 bg-transparent text-gray-400 outline-none w-full font-manrope text-xs"
                  />
                </div>
              </div>

              {/* Add Book Button */}
              <Link href="/staff/dashboard/book-management/create-book">
                <button className="w-[90px] h-[30px] bg-[#2e3105] text-white text-xs rounded-2xl">
                  Add Book
                </button>
              </Link>
            </div>
          </div>

          {/* Book Grid and Sidebar Container */}
          <div className="flex gap-8 justify-between">
            {/* Book Grid */}
            <div className="flex-1 grid grid-cols-4 gap-x-4 gap-y-4">
              {loading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="col-span-4 text-center py-10 text-red-500">{error}</div>
              ) : books.length === 0 ? (
                <div className="col-span-4 text-center py-10">
                  No books available. Add a new book to get started!
                </div>
              ) : (
                books.map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.book_title}
                    author={book.author}
                    imageUrl={book.cover_image || null}
                    rating={book.rating || 0}
                  />
                ))
              )}
            </div>

            {/* Categories Sidebar - Fixed width */}
            <div className="w-[250px] flex-shrink-0">
              {/* Categories sections - with white wrapper */}
              <div className="space-y-4 bg-white rounded-2xl border border-[#cdcdcd] p-6">
                <div className="mb-4">
                  <h2 className="text-black text-md font-medium mb-4">
                    Categories
                  </h2>
                  {/* Search in categories */}
                  <div className="w-full h-[33px] bg-neutral-50 rounded-2xl border border-[#cdcdcd] flex items-center px-3 mb-4">
                    <BiSearch className="text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search categories"
                      className="ml-2 bg-transparent text-xs text-gray-400 outline-none w-full font-manrope"
                    />
                  </div>
                </div>

                {/* Genres */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-black text-sm font-medium">Genres</h3>
                    <Link href="/staff/dashboard/book-management/genre-settings">
                      <button className="text-[#2e3105] text-xs hover:underline">
                        Manage
                      </button>
                    </Link>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto pr-2">
                    {genres.slice(0, 10).map((genre) => (
                      <label key={genre.id} className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre.genre_name)}
                          onChange={() => handleGenreChange(genre.genre_name)}
                          className="w-4 h-4 rounded-2xl border-[#cdcdcd]"
                          style={{ accentColor: "#2e3105" }}
                        />
                        <span className="text-black text-xs font-medium">
                          {genre.genre_name}
                        </span>
                      </label>
                    ))}
                    {genres.length > 10 && (
                      <button 
                        onClick={() => setIsGenreModalOpen(true)}
                        className="text-[#2e3105] text-xs hover:underline font-medium"
                      >
                        View more genres
                      </button>
                    )}
                  </div>
                </div>

                {/* Book Type */}
                <div>
                  <h3 className="text-black text-sm font-medium mb-3">Book Type</h3>
                  <div>
                    <label className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedBookTypes.includes('Local Books')}
                        onChange={() => handleBookTypeChange('Local Books')}
                        className="w-4 h-4 rounded-2xl border-[#cdcdcd]"
                        style={{ accentColor: "#2e3105" }}
                      />
                      <span className="text-black text-xs font-medium">
                        Local Books
                      </span>
                    </label>
                    <label className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedBookTypes.includes('International Books')}
                        onChange={() => handleBookTypeChange('International Books')}
                        className="w-4 h-4 rounded-2xl border-[#cdcdcd]"
                        style={{ accentColor: "#2e3105" }}
                      />
                      <span className="text-black text-xs font-medium">
                        International Books
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-8 h-8 mx-1 rounded-full ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-100'}`}
              >
                <IoChevronBackOutline />
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                // Show current page, first, last, and pages around current
                if (
                  pageNumber === 1 || 
                  pageNumber === totalPages || 
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`flex items-center justify-center w-8 h-8 mx-1 rounded-full ${
                        currentPage === pageNumber
                          ? 'bg-[#2e3105] text-white'
                          : 'text-black hover:bg-gray-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  (pageNumber === currentPage - 2 && currentPage > 3) ||
                  (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                ) {
                  return <span key={pageNumber} className="mx-1">...</span>;
                }
                return null;
              })}
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-8 h-8 mx-1 rounded-full ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-100'}`}
              >
                <IoChevronForwardOutline />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Genre Modal */}
      {isGenreModalOpen && (
        <GenreSelectModal
          isOpen={isGenreModalOpen}
          onClose={() => setIsGenreModalOpen(false)}
          genres={genres.map(genre => genre.genre_name)}
          selectedGenres={selectedGenres}
          onChange={selectedGenres => {
            setSelectedGenres(selectedGenres);
            setCurrentPage(1);
          }}
          title="Select Genres"
        />
      )}
    </div>
  );
};

export default CatalogStaff;
