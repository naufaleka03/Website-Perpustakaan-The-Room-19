"use client";

import { useState, useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
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

  // Add console log to debug image URLs
  console.log(`Book ${id} image URL:`, imageUrl);
  
  // Ensure imageUrl is valid and not null/undefined
  const displayUrl = imageUrl && imageUrl.trim() !== '' 
    ? imageUrl 
    : "https://placehold.co/219x312";
  
  return (
    <Link href={`/staff/dashboard/book-management/detail?id=${id}`}>
      <div className="relative cursor-pointer">
        <div className="w-full aspect-[180/250] rounded-2xl border border-[#cdcdcd] overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={displayUrl}
            alt={`${title} Cover`}
            onError={(e) => {
              console.error(`Error loading image for book ${id}:`, e);
              e.target.src = "https://placehold.co/219x312";
            }}
          />
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

const CatalogStaff = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedBookTypes, setSelectedBookTypes] = useState([]);

  useEffect(() => {
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
        
        const response = await fetch(`/api/books?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        
        const data = await response.json();
        setBooks(data.books || []);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchQuery, selectedGenres, selectedBookTypes]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const handleBookTypeChange = (type) => {
    setSelectedBookTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
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
                <div className="col-span-4 text-center py-10">Loading books...</div>
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
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full h-[33px] bg-neutral-50 rounded-2xl border border-[#cdcdcd] pl-10 text-xs font-manrope"
                    />
                    <BiSearch
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>

                <section>
                  <h3 className="text-black text-sm font-medium mb-4">
                    Genres
                  </h3>
                  {/* Genre checkboxes container */}
                  <div className="mb-3">
                    <div className="max-h-[100px] overflow-y-auto pr-2">
                      {allGenres.map((genre) => (
                        <div
                          key={genre}
                          className="flex items-center gap-3 mb-3"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGenres.includes(genre)}
                            onChange={() => handleGenreChange(genre)}
                            className="w-[16px] h-[16px] rounded-2xl border border-[#cdcdcd]"
                            style={{ accentColor: "#2e3105" }}
                          />
                          <span className="text-black text-xs font-medium font-manrope">
                            {genre}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Type of Books Section */}
                <section>
                  <h3 className="text-black text-sm font-medium mb-4">
                    Type of Books
                  </h3>
                  <div className="space-y-3">
                    {["Local Books", "International Books"].map((type) => (
                      <div key={type} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedBookTypes.includes(type)}
                          onChange={() => handleBookTypeChange(type)}
                          className="w-[16px] h-[16px] rounded-2xl border border-[#cdcdcd]"
                          style={{ accentColor: "#2e3105" }}
                        />
                        <span className="text-black text-xs font-medium font-manrope">
                          {type}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogStaff;
