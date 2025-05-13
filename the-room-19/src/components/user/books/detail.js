"use client";
import { useState, useEffect } from "react";
import { AiFillStar } from "react-icons/ai";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const Detail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get("id");

  const [book, setBook] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId) {
        setError("Book ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/books/${bookId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch book details');
        }
        
        const data = await response.json();
        setBook(data.book || null);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  if (loading) {
    return (
      <div className="flex-1 min-h-[calc(100vh-72px)] bg-white flex justify-center items-center">
        <p>Loading book details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex-1 min-h-[calc(100vh-72px)] bg-white flex flex-col justify-center items-center">
        <p className="text-red-500 mb-4">{error || "Book not found"}</p>
        <Link href="/user/dashboard/books/catalog">
          <button className="bg-[#2e3105] text-white px-4 py-2 rounded-lg text-sm">
            Back to Catalog
          </button>
        </Link>
      </div>
    );
  }

  // Generate star ratings
  const renderStars = () => {
    const stars = [];
    const rating = Math.round(book.rating);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<AiFillStar key={i} className="text-[#ECB43C] text-lg" />);
      } else {
        stars.push(<AiFillStar key={i} className="text-gray-300 text-lg" />);
      }
    }
    
    return stars;
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
      <div className="w-full h-full relative bg-white">
        <div className="w-full mx-auto px-12 py-8">
          <div className="flex gap-8">
            {/* Book Cover */}
            <div className="w-[180px] h-[250px] rounded-2xl overflow-hidden">
              <img
                src={book.cover_image || "https://placehold.co/180x250"}
                alt={`${book.book_title} Cover`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Book Details */}
            <div className="flex-1">
              <h1 className="text-black text-lg font-extrabold font-manrope mb-2">
                {book.book_title}
              </h1>
              <h2 className="text-black text-base font-medium font-manrope mb-4">
                {book.author}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                {renderStars()}
                <span className="text-[#666666] text-xs ml-2">
                  {(typeof book.rating === 'number' ? book.rating : 0).toFixed(1)}
                </span>
              </div>

              {/* Tabs */}
              <div className="border-b border-[#767676]/40">
                <div className="flex gap-8">
                  <button className="text-[#2e3105] text-sm font-medium pb-2 border-b-2 border-[#2e3105]">
                    Description
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="py-6 text-xs font-manrope leading-relaxed">
                <p className="text-justify font-normal text-black">
                  {book.description 
                    ? (isExpanded 
                        ? book.description 
                        : book.description.length > 200 
                          ? book.description.slice(0, 200) + "..." 
                          : book.description)
                    : "No description available for this book."}
                </p>
                {book.description && book.description.length > 200 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-[#ECB43C] text-xs font-bold mt-2 hover:underline"
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>

              {/* Book Details Section */}
              <div className="mb-6">
                <div className="border-b border-[#767676]/40">
                  <div className="flex gap-8">
                    <button className="text-[#2e3105] text-sm font-medium pb-2 border-b-2 border-[#2e3105]">
                      Detail
                    </button>
                  </div>
                </div>

                <div className="py-6">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-black font-medium">Author</span>
                    </div>
                    <div className="text-black">{book.author}</div>
                    
                    <div>
                      <span className="text-black font-medium">Publisher</span>
                    </div>
                    <div className="text-black">{book.publisher}</div>
                    
                    <div>
                      <span className="text-black font-medium">Published Year</span>
                    </div>
                    <div className="text-black">{book.published_year}</div>
                    
                    <div>
                      <span className="text-black font-medium">Language</span>
                    </div>
                    <div className="text-black">{book.language}</div>
                    
                    <div>
                      <span className="text-black font-medium">ISBN</span>
                    </div>
                    <div className="text-black">{book.isbn_code}</div>
                    
                    <div>
                      <span className="text-black font-medium">Genre</span>
                    </div>
                    <div className="text-black">{book.genre}</div>
                    
                    <div>
                      <span className="text-black font-medium">Book Type</span>
                    </div>
                    <div className="text-black">{book.book_type}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Status Card */}
            <div className="w-[280px] h-fit bg-white rounded-2xl border border-[#cdcdcd] p-6">
              <h3 className="text-black text-base font-semibold text-center mb-4">
                Book Status
              </h3>
              <hr className="border-[#767676]/40 mb-4" />

              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-[#c3efc3] rounded-full" />
                <span className="text-black text-xs font-normal">
                  Available now
                </span>
                <span className="text-black text-xs font-normal ml-auto">
                  Total stock:{" "}
                  <span className="text-[#ecb43c] font-normal">5 left</span>
                </span>
              </div>

              <div className="space-y-3 mt-6">
                <button className="w-full h-[35px] bg-[#2e3105] text-white text-xs rounded-2xl">
                  Borrow Book
                </button>
                <button className="w-full h-[35px] border border-[#2e3105] text-[#2e3105] text-xs rounded-2xl">
                  Cart
                </button>
              </div>

              <hr className="border-[#767676]/40 my-6" />

              <h3 className="text-black text-base font-semibold text-center mb-2">
                Return Policy
              </h3>
              <p className="text-black text-xs text-justify font-medium font-manrope leading-relaxed">
                Book returns are automatic 7 days after borrowing. You can
                extend the loan period by following certain terms and
                conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
