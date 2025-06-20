"use client";
import { useState, useEffect } from "react";
import React from "react";
import { AiFillStar } from "react-icons/ai";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";
import { createClient } from "@/app/supabase/client";
import PaymentSummaryModal from "@/components/payment/payment-summary-borrow";

const Detail = ({ memberStatus = "guest" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get("id");

  const [book, setBook] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lendCount, setLendCount] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [user, setUser] = useState(null);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [borrowResult, setBorrowResult] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [borrowDate, setBorrowDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRekom, setLoadingRekom] = useState(true);
  const [errorRekom, setErrorRekom] = useState(null);
  const [rekomCovers, setRekomCovers] = useState({});
  const [copies, setCopies] = useState([]);
  const [selectedCopyIndex, setSelectedCopyIndex] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Ambil data visitor (member)
          const { data: visitorData, error: visitorError } = await supabase
            .from("visitors")
            .select("*")
            .eq("id", user.id)
            .single();

          if (visitorError) {
            console.error("Error fetching visitor data:", visitorError);
            return;
          }

          setUser({
            id: user.id,
            ...visitorData,
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

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
          throw new Error("Failed to fetch book details");
        }

        const data = await response.json();
        setBook(data.book || null);

        // Fetch lend count
        const lendResponse = await fetch(`/api/books/${bookId}/lend-count`);
        if (lendResponse.ok) {
          const lendData = await lendResponse.json();
          setLendCount(lendData.count || 0);
        }

        // Fetch rating count
        const ratingResponse = await fetch(`/api/books/${bookId}/rating-count`);
        if (ratingResponse.ok) {
          const ratingData = await ratingResponse.json();
          setRatingCount(ratingData.count || 0);
        }
      } catch (err) {
        console.error("Error fetching book details:", err);
        setError("Failed to load book details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch rekomendasi buku
    const fetchRecommendations = async () => {
      if (!bookId) return;
      setLoadingRekom(true);
      setErrorRekom(null);
      try {
        const response = await fetch(
          `http://localhost:5000/recommendation?book_id=${bookId}`
        );
        if (!response.ok) throw new Error("Gagal mengambil rekomendasi buku");
        const data = await response.json();
        setRecommendations(data.rekomendasi || []);
        // Setelah dapat rekomendasi, fetch cover untuk setiap rekomendasi
        if (data.rekomendasi && data.rekomendasi.length > 0) {
          const coverPromises = data.rekomendasi.map(async (rec) => {
            try {
              const res = await fetch(`/api/books/${rec.book_id}`);
              if (!res.ok) return [rec.book_id, null];
              const bookData = await res.json();
              return [rec.book_id, bookData.book?.cover_image || null];
            } catch {
              return [rec.book_id, null];
            }
          });
          const coverResults = await Promise.all(coverPromises);
          const coverMap = {};
          coverResults.forEach(([id, cover]) => {
            coverMap[id] = cover;
          });
          setRekomCovers(coverMap);
        } else {
          setRekomCovers({});
        }
      } catch (err) {
        setErrorRekom("Gagal memuat rekomendasi buku.");
        setRecommendations([]);
        setRekomCovers({});
      } finally {
        setLoadingRekom(false);
      }
    };

    const fetchCopies = async () => {
      if (!bookId) return;
      const res = await fetch(`/api/manage-books?id=${bookId}`);
      const data = await res.json();
      setCopies(data.data || []);
    };

    fetchUserData();
    fetchBookDetails();
    fetchRecommendations();
    fetchCopies();
  }, [bookId]);

  const handleBorrowBook = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!book) {
      setError("Book data not available");
      return;
    }
    // CEK JUMLAH PEMINJAMAN ON GOING
    try {
      const response = await fetch(`/api/loans?user_id=${user.id}`);
      const data = await response.json();
      if (response.ok) {
        const onGoingLoans = (data.loans || []).filter(
          (l) => l.status === "On Going"
        );
        if (onGoingLoans.length >= 2) {
          setShowLimitModal(true);
          return;
        }
      }
    } catch (err) {
      setShowLimitModal(true);
      return;
    }
    // Tampilkan modal payment summary, set tanggal pinjam dan kembali
    const today = new Date();
    const returnDt = new Date();
    returnDt.setDate(today.getDate() + 7);
    setBorrowDate(today);
    setReturnDate(returnDt);
    setShowPaymentModal(true);
  };

  // Callback setelah pembayaran sukses
  const handlePaymentSuccess = async (paymentResult) => {
    setShowPaymentModal(false);
    // Proses peminjaman buku setelah pembayaran sukses
    try {
      setIsBorrowing(true);
      setBorrowResult(null);
      const loanData = {
        user_id: user.id,
        book_id1: book.id,
        book_id2: null,
        book_title1: book.book_title,
        book_title2: null,
        genre1: book.genre,
        genre2: null,
        cover_image1: book.cover_image,
        cover_image2: null,
        price1: book.price,
        price2: null,
        full_name: user.name,
        email: user.email,
        phone_number: user.phone_number || "-",
        payment_id: paymentResult.order_id,
        payment_status: paymentResult.transaction_status,
        payment_method: paymentResult.payment_type,
      };
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loanData),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to borrow book");
      }
      setBorrowResult({
        success: true,
        message:
          "Book borrowed successfully! Return date: " +
          new Date(result.loan.loan_due).toLocaleDateString("id-ID"),
      });
      setShowSuccessModal(true);
    } catch (err) {
      setBorrowResult({
        success: false,
        message: err.message || "Gagal meminjam buku. Silakan coba lagi nanti.",
      });
    } finally {
      setIsBorrowing(false);
    }
  };

  // Loading skeleton for the detail page
  const DetailLoadingSkeleton = () => (
    <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
      <div className="w-full h-full relative bg-white">
        <div className="w-full mx-auto px-12 py-8">
          <div className="flex gap-8 animate-pulse">
            {/* Book Cover Skeleton */}
            <div className="w-[180px] h-[250px] rounded-2xl bg-gray-200"></div>

            {/* Book Details Skeleton */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
              </div>

              {/* Themes Skeleton */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-20 bg-gray-200 rounded-full"
                  ></div>
                ))}
              </div>

              {/* Condition Skeleton */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3].map((i) => (
                    <Fragment key={i}>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </Fragment>
                  ))}
                </div>
              </div>

              {/* Tabs Skeleton */}
              <div className="border-b border-[#767676]/40 mt-4">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>

              {/* Description Skeleton */}
              <div className="py-4">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>

              {/* Details Skeleton */}
              <div className="mb-6">
                <div className="border-b border-[#767676]/40">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="py-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Fragment key={i}>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Book Status Card Skeleton */}
            <div className="w-[280px] h-fit bg-white rounded-2xl border border-[#cdcdcd] p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <hr className="border-[#767676]/40 mb-4" />

              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>

              <div className="space-y-3 mt-6">
                <div className="h-9 bg-gray-200 rounded-2xl w-full"></div>
                <div className="h-9 bg-gray-200 rounded-2xl w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <DetailLoadingSkeleton />;
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

  // Utilitas untuk mengambil inisial judul buku
  function getBookInitials(title) {
    if (!title) return "";
    return title
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  // Fungsi untuk memotong judul buku dengan ellipsis jika terlalu panjang
  function truncateTitle(title, maxLength = 40) {
    if (!title) return "";
    if (title.length <= maxLength) return title;
    // Potong di batas spasi terakhir sebelum maxLength jika memungkinkan
    const truncated = title.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 0) {
      return truncated.slice(0, lastSpace) + "...";
    }
    return truncated + "...";
  }

  return (
    <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
      {/* Modal Limit Peminjaman */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xs text-center shadow-lg relative">
            <h2 className="text-lg font-bold mb-2 text-[#e53e3e]">Warning</h2>
            <p className="text-sm text-gray-700 mb-4">
              You cannot borrow additional books. The maximum allowed is 2 books
              at a time.
            </p>
            <button
              className="px-4 py-2 bg-[#2e3105] text-white rounded-lg hover:bg-[#222] transition-colors text-xs"
              onClick={() => setShowLimitModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Modal Success Peminjaman */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xs text-center shadow-lg relative">
            <h2 className="text-lg font-bold mb-2 text-[#2e3105]">Success</h2>
            <p className="text-sm text-gray-700 mb-4">
              {borrowResult?.message || "Book borrowed successfully"}
            </p>
            <button
              className="px-4 py-2 bg-[#2e3105] text-white rounded-lg hover:bg-[#222] transition-colors text-xs"
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/user/dashboard/books/catalog");
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showPaymentModal && (
        <PaymentSummaryModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          book={{
            ...book,
            user_id: user?.id,
            full_name: user?.name,
            email: user?.email,
            phone_number: user?.phone_number,
          }}
          borrowDate={borrowDate}
          returnDate={returnDate}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      <div className="w-full h-full relative bg-white">
        <div className="w-full mx-auto px-12 py-8">
          <div className="flex gap-8">
            {/* Book Cover */}
            <div className="w-[180px] h-[250px] rounded-2xl overflow-hidden flex items-center justify-center bg-[#eff0c3]">
              {book.cover_image && book.cover_image.trim() !== "" ? (
                <img
                  src={book.cover_image}
                  alt={`${book.book_title} Cover`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/180x250";
                  }}
                />
              ) : (
                <span className="text-[#52570d] font-bold text-5xl select-none">
                  {getBookInitials(book.book_title)}
                </span>
              )}
            </div>

            {/* Book Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-black text-lg font-extrabold font-manrope mb-2">
                    {book.book_title}
                  </h1>
                  {book.price && (
                    <div
                      className="text-[#2e3105] text-sm font-semibold mb-2"
                      style={{ fontWeight: 500 }}
                    >
                      Rp {parseInt(book.price).toLocaleString("id-ID")}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    {/* Rating and Reviews */}
                    {/* <div className="flex items-center">
                      <AiFillStar className="text-[#ECB43C] text-lg" />
                      <span className="text-[#666666] text-xs ml-1">
                        {(typeof book.rating === 'number' ? book.rating : 0).toFixed(1)}
                      </span>
                      <span className="text-[#666666] text-xs ml-1">
                        ({ratingCount} reviews)
                      </span>
                    </div> */}
                    {/* <div className="text-[#666666] text-xs ml-4">
                      Stok: <span className="font-bold">{book.stock ?? 0}</span>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Themes */}
              {book.themes && book.themes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {book.themes.map((theme) => (
                    <button
                      key={theme}
                      className="bg-[#2e3105]/10 px-2 py-1 rounded-full text-xs text-[#666666] transition-colors hover:bg-[#2e3105]/30 hover:text-[#232310] active:bg-[#2e3105]/50 focus:outline-none focus:ring-2 focus:ring-[#2e3105]"
                      onClick={() =>
                        router.push(
                          `/user/dashboard/books/catalog?theme=${encodeURIComponent(
                            theme
                          )}`
                        )
                      }
                      type="button"
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              )}

              {/* Book Condition */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-black text-sm font-medium mb-2 flex items-center gap-4">
                  Book Condition
                </h3>
                {copies.length > 0 && (
                  <div className="flex justify-start mb-2">
                    <div
                      className="relative"
                      style={{ width: "fit-content", minWidth: "108px" }}
                    >
                      <select
                        className="appearance-none border-2 border-[#2e3105] rounded-full px-3 py-0.5 text-xs font-medium font-['Poppins'] bg-white text-[#222] focus:outline-none focus:border-[#2e3105] transition w-full pr-8 shadow-sm"
                        value={selectedCopyIndex}
                        onChange={(e) =>
                          setSelectedCopyIndex(Number(e.target.value))
                        }
                        disabled={copies.length === 1}
                        style={{ fontSize: "0.75rem", height: "1.75rem" }}
                      >
                        {copies.map((copy, idx) => (
                          <option
                            key={copy.id}
                            value={idx}
                            className="rounded-full text-xs"
                          >
                            Copy {copy.copy}
                          </option>
                        ))}
                      </select>
                      {/* Custom dropdown arrow */}
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#2e3105]">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="M6 8l4 4 4-4"
                            stroke="#2e3105"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                {/* Book condition info below dropdown */}
                {copies.length === 0 ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-black font-medium">Status</span>
                    </div>
                    <div>
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-800">
                        Not specified
                      </span>
                    </div>
                    <div>
                      <span className="text-black font-medium">
                        Description
                      </span>
                    </div>
                    <div className="text-black">No description available</div>
                    <div>
                      <span className="text-black font-medium">
                        Last Updated
                      </span>
                    </div>
                    <div className="text-black">Not available</div>
                  </div>
                ) : (
                  (() => {
                    const copy = copies[selectedCopyIndex] || {};
                    let badgeClass =
                      "px-2 py-1 rounded-full text-xs font-medium ";
                    const status = (copy.status || "").toLowerCase();
                    if (
                      status === "not specified" ||
                      status === "not_specified"
                    ) {
                      badgeClass += "bg-yellow-100 text-yellow-800";
                    } else if (status === "pristine") {
                      badgeClass += "bg-green-100 text-green-800";
                    } else if (status === "good") {
                      badgeClass += "bg-blue-100 text-blue-800";
                    } else if (status === "fair") {
                      badgeClass += "bg-orange-100 text-orange-800";
                    } else {
                      badgeClass += "bg-gray-200 text-gray-800";
                    }
                    return (
                      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                        <div>
                          <span className="text-black font-medium">Status</span>
                        </div>
                        <div>
                          <span className={badgeClass}>
                            {copy.status || "Not specified"}
                          </span>
                        </div>
                        <div>
                          <span className="text-black font-medium">
                            Description
                          </span>
                        </div>
                        <div className="text-black">
                          {copy.comment || "No description available"}
                        </div>
                        <div>
                          <span className="text-black font-medium">
                            Last Updated
                          </span>
                        </div>
                        <div className="text-black">
                          {copy.updated_at
                            ? new Date(copy.updated_at).toLocaleString()
                            : "Not available"}
                        </div>
                      </div>
                    );
                  })()
                )}
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
              <div className="py-4 text-xs font-manrope leading-relaxed">
                <p className="text-justify font-normal text-black">
                  {book.description
                    ? isExpanded
                      ? book.description
                      : book.description.length > 200
                      ? book.description.slice(0, 200) + "..."
                      : book.description
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
              <div className="mb-4">
                <div className="border-b border-[#767676]/40">
                  <div className="flex gap-8">
                    <button className="text-[#2e3105] text-sm font-medium pb-2 border-b-2 border-[#2e3105]">
                      Detail
                    </button>
                  </div>
                </div>

                <div className="py-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-black font-medium">Author</span>
                    </div>
                    <div className="text-black">{book.author || "Not set"}</div>

                    <div>
                      <span className="text-black font-medium">Publisher</span>
                    </div>
                    <div className="text-black">
                      {book.publisher || "Not set"}
                    </div>

                    <div>
                      <span className="text-black font-medium">
                        Published Year
                      </span>
                    </div>
                    <div className="text-black">
                      {book.published_year || "Not set"}
                    </div>

                    <div>
                      <span className="text-black font-medium">Language</span>
                    </div>
                    <div className="text-black">
                      {book.language || "Not set"}
                    </div>

                    <div>
                      <span className="text-black font-medium">ISBN</span>
                    </div>
                    <div className="text-black">
                      {book.isbn_code || "Not set"}
                    </div>

                    <div>
                      <span className="text-black font-medium">Genre</span>
                    </div>
                    <div className="text-black">{book.genre || "Not set"}</div>

                    <div>
                      <span className="text-black font-medium">Book Type</span>
                    </div>
                    <div className="text-black">
                      {book.book_type || "Not set"}
                    </div>

                    <div>
                      <span className="text-black font-medium">
                        Content Type
                      </span>
                    </div>
                    <div className="text-black">
                      {book.content_type || "Not set"}
                    </div>

                    <div>
                      <span className="text-black font-medium">Cover Type</span>
                    </div>
                    <div className="text-black">
                      {book.cover_type || "Not set"}
                    </div>

                    <div>
                      <span className="text-black font-medium">Usage</span>
                    </div>
                    <div className="text-black">{book.usage || "Not set"}</div>
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
                <div
                  className={`w-2 h-2 rounded-full ${
                    book.stock > 0 ? "bg-[#c3efc3]" : "bg-red-400"
                  }`}
                />
                <span className="text-black text-xs font-normal">
                  {book.stock > 0 ? "Available now" : "Out of stock"}
                </span>
                <span className="text-black text-xs font-normal ml-auto">
                  Total stock:{" "}
                  <span className="text-[#ecb43c] font-normal">
                    {book.stock ?? 0} left
                  </span>
                </span>
              </div>
              {/* Alert hanya muncul jika stock 0 dan usage adalah 'On-site and For Rent' */}
              {book.stock === 0 && book.usage === "On-site and For Rent" && (
                <div className="my-4 p-2 rounded text-xs text-center bg-red-100 text-red-800">
                  Book is out of stock and cannot be borrowed.
                </div>
              )}
              {/* Hide Borrow and Cart if usage is On-Site Only */}
              {book.usage !== "On-Site Only" && (
                <div className="space-y-3 mt-6">
                  <button
                    className={`w-full h-[35px] text-white text-xs hover:bg-[#3e4310] rounded-2xl ${
                      isBorrowing ||
                      book.stock === 0 ||
                      memberStatus === "guest"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#2e3105]"
                    }`}
                    onClick={handleBorrowBook}
                    disabled={
                      isBorrowing ||
                      book.stock === 0 ||
                      memberStatus === "guest"
                    }
                  >
                    {memberStatus === "guest"
                      ? "Borrow Book (Members Only)"
                      : isBorrowing
                      ? "Processing..."
                      : "Borrow Book"}
                  </button>
                  {/* <button 
                    className={`w-full h-[35px] border border-[#2e3105] text-[#2e3105] text-xs rounded-2xl ${book.stock === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    disabled={book.stock === 0}
                  >
                    Cart
                  </button> */}
                  {memberStatus === "guest" && (
                    <div className="text-xs text-red-600 text-center mt-2 font-semibold">
                      You must be a member to borrow books. Please join as a
                      member to make a loan.
                    </div>
                  )}
                </div>
              )}

              <hr className="border-[#767676]/40 my-6" />

              <h3 className="text-black text-base font-semibold text-center mb-2">
                Return Policy
              </h3>
              <p className="text-black text-xs text-justify font-medium font-manrope leading-relaxed">
                Once a book is borrowed, a 7-day loan period begins. If the book
                is not returned after this period, a late fee will be applied.
                Borrowers may request a loan extension before or after the
                initial due date.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Rekomendasi Buku */}
      <div className="mt-2 px-4 pb-10">
        <h2 className="text-lg font-bold text-black flex items-center mb-6">
          {/* <FaStar className="mr-2 text-yellow-400" /> */}
          Similar Book Recommendations
        </h2>

        {loadingRekom ? (
          <div className="flex space-x-3 overflow-x-auto p-4 scrollbar-hide">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-none w-48 group animate-pulse">
                <div className="aspect-[3/4] w-full rounded-2xl bg-gray-200 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : errorRekom ? (
          <div className="text-red-500 text-sm">{errorRekom}</div>
        ) : recommendations.length === 0 ? (
          <div className="text-gray-500 text-sm">
            Tidak ada rekomendasi buku mirip.
          </div>
        ) : (
          <div className="flex space-x-3 overflow-x-auto p-4 scrollbar-hide">
            {recommendations.map((rec) => (
              <Link
                key={rec.book_id}
                href={`/user/dashboard/books/catalog/detail?id=${rec.book_id}`}
                className="flex-none w-48 group transition-transform duration-200 hover:scale-105"
              >
                <div className="relative mb-4">
                  <div className="w-[135px] h-[187px] rounded-2xl overflow-hidden bg-[#eff0c3] shadow-lg group-hover:shadow-xl group-hover:scale-101 transition-transform duration-300 flex items-center justify-center">
                    {rekomCovers[rec.book_id] &&
                    rekomCovers[rec.book_id].trim() !== "" ? (
                      <img
                        src={rekomCovers[rec.book_id]}
                        alt={rec.book_title + " Cover"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/120x160";
                        }}
                      />
                    ) : (
                      <span className="text-[#52570d] font-bold text-3xl select-none">
                        {getBookInitials(rec.book_title)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-between min-h-[88px]">
                  <h3 className="font-semibold text-black text-sm line-clamp-2 group-hover:text-black transition-colors min-h-[40px] max-h-[40px] overflow-hidden">
                    {rec.book_title.length > 40
                      ? rec.book_title.slice(
                          0,
                          rec.book_title.lastIndexOf(" ", 40)
                        ) + "..."
                      : rec.book_title}
                  </h3>
                  <p className="text-black text-xs truncate mt-1">
                    {rec.author}
                  </p>
                  <span className="mt-1 px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-full w-fit">
                    {rec.genre || rec.genre1 || "-"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Detail;
