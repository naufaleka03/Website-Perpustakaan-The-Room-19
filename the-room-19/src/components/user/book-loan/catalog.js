"use client";
import { useState } from "react";
import { BiSearch } from "react-icons/bi";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import { BsCart3 } from "react-icons/bs";

const Catalog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [highRatingOnly, setHighRatingOnly] = useState(false);
  const [bookType, setBookType] = useState({
    local: false,
    international: false,
  });

  // Data buku
  const booksData = [
    {
      id: 1,
      title: "I Want to Die but I Want to Eat Tteokpokki",
      author: "Baek Se Hee",
      imageUrl: "https://placehold.co/219x312",
    },
    {
      id: 2,
      title: "The Midnight Library",
      author: "Matt Haig",
      imageUrl: "https://placehold.co/219x312",
    },
    {
      id: 3,
      title: "Atomic Habits",
      author: "James Clear",
      imageUrl: "https://placehold.co/219x312",
    },
    {
      id: 4,
      title: "The Psychology of Money",
      author: "Morgan Housel",
      imageUrl: "https://placehold.co/219x312",
    },
    {
      id: 5,
      title: "Think and Grow Rich",
      author: "Napoleon Hill",
      imageUrl: "https://placehold.co/219x312",
    },
    {
      id: 6,
      title: "Rich Dad Poor Dad",
      author: "Robert Kiyosaki",
      imageUrl: "https://placehold.co/219x312",
    },
    {
      id: 7,
      title: "The 48 Laws of Power",
      author: "Robert Greene",
      imageUrl: "https://placehold.co/219x312",
    },
    {
      id: 8,
      title: "How to Win Friends and Influence People",
      author: "Dale Carnegie",
      imageUrl: "https://placehold.co/219x312",
    },
  ];

  // Data genre
  const allGenres = [
    "Arts & Architecture",
    "Business",
    "CCI",
    "Children's Books",
    "Chinese Literature",
    "Climate Change",
    "Colonialism",
    "Colonialism, Race, Class (Fict.)",
    "Crime & Mystery",
    "Dystopian & Post-Apocalyptic",
    "Education",
    "Family",
    "Fantasy & Sci-Fi",
    "Feminism",
    "Historical Fiction",
    "History",
    "Indonesian Literature",
    "Japanese Literature",
    "Korean Literature",
    "Magazine & Zine",
    "Memoirs & Biography",
    "Natural Science",
    "On Womanhood",
    "Other People's Book",
    "Pets!",
    "Philosophy",
    "Poetry & Literary Criticism",
    "Politics & Sociology",
    "Psychology & Self Help",
    "Religions",
    "Romance",
    "Russian Literature",
    "Science",
    "Self Discovery",
    "Travel",
    "Western Classics",
    "Western Contemporary Lit.",
    "World Literature",
  ];

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
          {booksData.map((book) => (
            <div key={book.id} className="relative">
              <div className="aspect-[180/250] rounded-2xl border border-[#cdcdcd] overflow-hidden">
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-center text-black text-xs font-bold mt-1 line-clamp-1">
                {book.title}
              </h3>
              <p className="text-center text-[#b5b3b3] text-xs font-semibold">
                {book.author}
              </p>
            </div>
          ))}
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
                {["Local Books", "International Books"].map((type) => (
                  <label key={type} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={bookType[type.toLowerCase().split(" ")[0]]}
                      onChange={(e) =>
                        setBookType({
                          ...bookType,
                          [type.toLowerCase().split(" ")[0]]: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded-2xl border-[#cdcdcd]"
                      style={{ accentColor: "#2e3105" }}
                    />
                    <span className="text-black text-xs font-medium">
                      {type}
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