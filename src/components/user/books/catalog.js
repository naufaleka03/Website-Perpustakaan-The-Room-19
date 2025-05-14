"use client";
import { useState, useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import { BsCart3 } from "react-icons/bs";
import Link from "next/link";
import GenreSelectModal from "@/components/common/GenreSelectModal";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const booksPerPage = 12;
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);

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
    "Biography",
    "Comics & Graphic Novels",
    "Cooking",
    "Education",
    "Health & Fitness",
    "History",
    "Horror",
    "Literary Fiction",
    "Mathematics",
    "Medical",
    "Philosophy",
    "Poetry",
    "Politics",
    "Religion",
    "Sports",
    "Technology",
    "Travel",
  ];

  // Display only first 15 genres initially
  const initialVisibleGenres = allGenres.slice(0, 15);

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

    fetchBooks();
  }, [searchQuery, selectedGenres, highRatingOnly, bookType, currentPage]);

  // Function to get book title initials
  const getBookInitials = (title) => {
    if (!title) return "";
    return title
      .split(" ")
      .map(word => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };
  
  // Handle genre selection from modal
  const handleGenresChange = (newSelectedGenres) => {
    setSelectedGenres(newSelectedGenres);
  };
  
  // Load skeleton component
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
            <LoadingSkeleton />
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
                    {book.cover_image ? (
                      <img
                        src={book.cover_image}
                        alt={book.book_title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500">
                        {getBookInitials(book.book_title)}
                      </div>
                    )}
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-black text-sm font-medium">Genres</h3>
                {allGenres.length > 15 && (
                  <button 
                    onClick={() => setIsGenreModalOpen(true)}
                    className="text-[#2e3105] text-xs hover:underline"
                  >
                    See all
                  </button>
                )}
              </div>
              <div className="max-h-[200px] overflow-y-auto pr-2">
                {initialVisibleGenres.map((genre) => (
                  <label key={genre} className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre)}
                      onChange={() => {
                        if (selectedGenres.includes(genre)) {
                          setSelectedGenres(selectedGenres.filter(g => g !== genre));
                        } else {
                          setSelectedGenres([...selectedGenres, genre]);
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

      {/* Genre Selection Modal */}
      <GenreSelectModal
        isOpen={isGenreModalOpen}
        onClose={() => setIsGenreModalOpen(false)}
        genres={allGenres}
        selectedGenres={selectedGenres}
        onChange={handleGenresChange}
        title="Select Genres"
      />
    </main>
  );
};

export default Catalog; 