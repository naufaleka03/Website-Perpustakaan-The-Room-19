import { BiSearch } from "react-icons/bi";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { BsCart3 } from "react-icons/bs";

// Data contoh buku
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

// Komponen Card Buku
const BookCard = ({ title, author, imageUrl }) => {
  return (
    <div className="relative">
      <div className="w-full aspect-[180/250] rounded-2xl border border-[#cdcdcd] overflow-hidden">
        <img
          className="w-full h-full object-cover"
          src={imageUrl}
          alt={`${title} Cover`}
        />
      </div>
      <h3 className="text-center text-black text-xs font-bold font-['Manrope'] mt-1 line-clamp-1">
        {title}
      </h3>
      <p className="text-center text-[#b5b3b3] text-xs font-semibold font-['Manrope']">
        {author}
      </p>
    </div>
  );
};

const CatalogPage = () => {
  return (
    <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
      <div className="w-full h-full relative bg-white">
        <div className="w-full mx-auto px-12 py-8">
          {/* Search Bar and Cart Container */}
          <div className="flex justify-center items-center mb-6">
            <div className="w-[600px] flex items-center gap-3"> 
              {/* Search Bar */}
              <div className="flex-1">
                <div className="w-full h-[38px] bg-[#f2f2f2] rounded-2xl border border-[#cdcdcd] flex items-center px-5">
                  <BiSearch className="text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search"
                    className="ml-2 bg-transparent text-gray-400 outline-none w-full font-manrope text-xs"
                  />
                </div>
              </div>
              
              {/* Cart Icon */}
              <button>
                <BsCart3 className="text-gray-600" size={24} />
              </button>
            </div>
          </div>

          {/* Book Grid and Sidebar Container */}
          <div className="flex gap-8 justify-between">
            {/* Book Grid */}
            <div className="flex-1 grid grid-cols-4 gap-x-4 gap-y-4">
              {booksData.map((book) => (
                <BookCard
                  key={book.id}
                  title={book.title}
                  author={book.author}
                  imageUrl={book.imageUrl}
                />
              ))}
            </div>

            {/* Categories Sidebar - Fixed width */}
            <div className="w-[250px] flex-shrink-0">
              {/* Categories sections - with white wrapper */}
              <div className="space-y-4 bg-white rounded-2xl border border-[#cdcdcd] p-6">
                <div className="mb-4">
                  <h2 className="text-black text-md font-medium mb-4">Categories</h2>
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
                  <h3 className="text-black text-sm font-medium mb-4">Genres</h3>
                  {/* Genre checkboxes */}
                  {[
                    "Arts & Architecture",
                    "Business",
                    "CCI",
                    "Children's Books",
                  ].map((genre) => (
                    <div key={genre} className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        className="w-[19px] h-[19px] rounded-2xl border border-[#cdcdcd]"
                      />
                      <span className="text-black text-xs font-medium font-['Manrope']">
                        {genre}
                      </span>
                    </div>
                  ))}
                  <button className="flex items-center text-black text-xs font-medium">
                    Load More
                    <IoIosArrowDown className="ml-1" />
                  </button>
                </section>

                {/* Ratings Section */}
                <section>
                  <h3 className="text-black text-sm font-medium mb-4">Ratings</h3>
                  <div className="space-y-3"></div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-[19px] h-[19px] rounded-2xl border border-[#cdcdcd]"
                    />
                    <div className="flex items-center gap-1">
                      <AiFillStar className="text-[#ECB43C]" />
                      <span className="text-black text-xs font-medium font-['Manrope']">
                        Rated 4 or higher
                      </span>
                    </div>
                  </div>
                </section>

                {/* Type of Books Section */}
                <section>
                  <h3 className="text-black text-sm font-medium mb-4">Type of Books</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-[19px] h-[19px] rounded-2xl border border-[#cdcdcd]"
                      />
                      <span className="text-black text-xs font-medium font-['Manrope']">
                        Local Books
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-[19px] h-[19px] rounded-2xl border border-[#cdcdcd]"
                      />
                      <span className="text-black text-xs font-medium font-['Manrope']">
                        International Books
                      </span>
                    </div>
                  </div>
                </section>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button className="w-[90px] h-[30px] border border-[#2e3105] text-[#111111] text-xs rounded-2xl">
                    Clear
                  </button>
                  <button className="w-[90px] h-[30px] bg-[#2e3105] text-white text-xs rounded-2xl">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination - centered */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button className="w-[35px] h-[30px] bg-[#f2f2f2] rounded-[10px] border border-[#cdcdcd] flex items-center justify-center text-black">
                <IoChevronBackOutline size={16} />
              </button>
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  className="w-[35px] h-[30px] bg-[#f2f2f2] rounded-[10px] border border-[#cdcdcd] flex items-center justify-center text-xs text-black"
                >
                  {num}
                </button>
              ))}
              <button className="w-[35px] h-[30px] bg-[#f2f2f2] rounded-[10px] border border-[#cdcdcd] flex items-center justify-center text-black">
                <IoChevronForwardOutline size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
