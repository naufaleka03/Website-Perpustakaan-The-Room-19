"use client";
import { useState, useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import { BsCart3 } from "react-icons/bs";
import Link from "next/link";

const Catalog = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [highRatingOnly, setHighRatingOnly] = useState(false);
  const [bookType, setBookType] = useState({
    local: false,
    international: false,
  });

  // Data genre
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
        
        if (bookType.local && !bookType.international) {
          params.append('bookType', 'Local Books');
        } else if (!bookType.local && bookType.international) {
          params.append('bookType', 'International Books');
        }
        
        if (highRatingOnly) {
          params.append('minRating', '4');
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
  }, [searchQuery, selectedGenres, highRatingOnly, bookType]);

  return (
    <main className="min-h-screen bg-white p-8">
      {/* Search dan Cart */}
      <div className="max-w-[600px] mx-auto flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full h-[38px] bg-[#f2f2f2] rounded-2xl border border-[#cdcdcd] pl-10 pr-4 text-xs text-gray-400"
          />
          <BiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        <button>
          <BsCart3 className="text-gray-600" size={24} />
        </button>
      </div>

      {/* Konten Utama */}
      <div className="flex gap-8">
        {/* Grid Buku */}
        <div className="flex-1 grid grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-4 text-center py-10">Loading books...</div>
          ) : error ? (
            <div className="col-span-4 text-center py-10 text-red-500">{error}</div>
          ) : books.length === 0 ? (
            <div className="col-span-4 text-center py-10">
              No books available based on your search criteria.
            </div>
          ) : (
            books.map((book) => (
              <Link href={`/user/dashboard/books/catalog/detail?id=${book.id}`} key={book.id}>
                <div className="relative">
                  <div className="aspect-[180/250] rounded-2xl border border-[#cdcdcd] overflow-hidden">
                    <img
                      src={book.cover_image || "https://placehold.co/219x312"}
                      alt={book.book_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-center text-black text-xs font-bold mt-1 line-clamp-1">
                    {book.book_title}
                  </h3>
                  <p className="text-center text-[#b5b3b3] text-xs font-semibold">
                    {book.author}
                  </p>
                  <div className="flex justify-center items-center mt-1">
                    <AiFillStar className="text-[#ECB43C] text-sm" />
                    <span className="text-[#666666] text-xs ml-1">
                      {(typeof book.rating === 'number' ? book.rating : 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Sidebar Filter */}
        <aside className="w-[250px] shrink-0">
          <div className="border border-[#cdcdcd] rounded-2xl p-6 space-y-6">
            {/* Categories */}
            <div>
              <h2 className="text-black text-md font-medium mb-4">
                Categories
              </h2>
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search categories"
                  className="w-full h-[33px] bg-neutral-50 rounded-2xl border border-[#cdcdcd] pl-10 text-xs"
                />
                <BiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>
            </div>

            {/* Genres */}
            <div>
              <h3 className="text-black text-sm font-medium mb-4">Genres</h3>
              <div className="max-h-[100px] overflow-y-auto pr-2">
                {allGenres.map((genre) => (
                  <label key={genre} className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGenres([...selectedGenres, genre]);
                        } else {
                          setSelectedGenres(
                            selectedGenres.filter((g) => g !== genre)
                          );
                        }
                      }}
                      className="w-4 h-4 rounded-2xl border-[#cdcdcd]"
                      style={{ accentColor: "#2e3105" }}
                    />
                    <span className="text-black text-xs font-medium">
                      {genre}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-black text-sm font-medium mb-4">Ratings</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={highRatingOnly}
                  onChange={(e) => setHighRatingOnly(e.target.checked)}
                  className="w-4 h-4 rounded-2xl border-[#cdcdcd]"
                  style={{ accentColor: "#2e3105" }}
                />
                <div className="flex items-center gap-1">
                  <AiFillStar className="text-[#ECB43C]" />
                  <span className="text-black text-xs font-medium">
                    Rated 4 or higher
                  </span>
                </div>
              </label>
            </div>

            {/* Book Types */}
            <div>
              <h3 className="text-black text-sm font-medium mb-4">
                Type of Books
              </h3>
              <div className="space-y-3">
                {[
                  { key: "local", label: "Local Books" },
                  { key: "international", label: "International Books" }
                ].map((type) => (
                  <label key={type.key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={bookType[type.key]}
                      onChange={(e) =>
                        setBookType({
                          ...bookType,
                          [type.key]: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded-2xl border-[#cdcdcd]"
                      style={{ accentColor: "#2e3105" }}
                    />
                    <span className="text-black text-xs font-medium">
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedGenres([]);
                  setHighRatingOnly(false);
                  setBookType({ local: false, international: false });
                }}
                className="flex-1 h-[30px] border border-[#2e3105] text-[#111111] text-xs rounded-2xl"
              >
                Clear
              </button>
              <button className="flex-1 h-[30px] bg-[#2e3105] text-white text-xs rounded-2xl">
                Apply
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
            <IoChevronBackOutline size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-white bg-[#2e3105] rounded text-xs">
            1
          </button>
          {[2, 3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 text-xs"
            >
              {num}
            </button>
          ))}
          <span className="px-1 text-gray-600 text-xs">...</span>
          <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 text-xs">
            15
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
            <IoChevronForwardOutline size={16} />
          </button>
        </div>
      </div>
    </main>
  );
};

export default Catalog; 