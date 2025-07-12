"use client";
import { useState, useEffect } from "react";
import React from "react";
import { AiFillStar } from "react-icons/ai";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";

const DetailStaff = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get("id");

  const [book, setBook] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lendCount, setLendCount] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [copies, setCopies] = useState([]);
  const [selectedCopyIndex, setSelectedCopyIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
          throw new Error("Failed to fetch book details");
        }

        const data = await response.json();
        console.log("Fetched book details:", data.book);
        setBook(data.book || null);

        // Ambil total_borrow dan stock langsung dari data.book
        setLendCount(data.book?.total_borrow || 0);

        // Fetch rating count
        const ratingResponse = await fetch(`/api/books/${bookId}/rating-count`);
        if (ratingResponse.ok) {
          const ratingData = await ratingResponse.json();
          setRatingCount(ratingData.count || 0);
        }

        // Fetch copies/condition
        const copiesRes = await fetch(`/api/manage-books?id=${bookId}`);
        const copiesData = await copiesRes.json();
        setCopies(copiesData.data || []);
        setSelectedCopyIndex(0);
      } catch (err) {
        console.error("Error fetching book details:", err);
        setError("Failed to load book details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      setLoading(true);
      console.log("Deleting book with ID:", bookId);
      const response = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to delete book");
      }

      console.log("Book deleted successfully");
      router.push("/staff/dashboard/book-management/catalog");
    } catch (err) {
      console.error("Error deleting book:", err);
      setError("Failed to delete book. Please try again later.");
      setLoading(false);
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
        <Link href="/staff/dashboard/book-management/catalog">
          <button className="bg-[#2e3105] text-white px-4 py-2 rounded-lg text-sm">
            Back to Catalog
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
      <div className="w-full h-full relative bg-white">
        <div className="w-full mx-auto px-12 py-8">
          <div className="flex gap-8">
            {/* Book Cover */}
            <div className="w-[180px] h-[250px] rounded-2xl overflow-hidden">
              <img
                src={
                  book.cover_image && book.cover_image.trim() !== ""
                    ? book.cover_image
                    : "https://placehold.co/180x250"
                }
                alt={`${book.book_title} Cover`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error(`Error loading image:`, e);
                  e.target.src = "https://placehold.co/180x250";
                }}
              />
            </div>

            {/* Book Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-black text-lg font-extrabold font-manrope mb-2">
                    {book.book_title}
                  </h1>
                  {book.price !== undefined && (
                    <div
                      className="text-[#2e3105] text-sm font-semibold mb-2"
                      style={{ fontWeight: 500 }}
                    >
                      {book.price === 0
                        ? "Free"
                        : `Rp ${parseInt(book.price).toLocaleString("id-ID")}`}
                    </div>
                  )}
                  
                  {/* <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center">
                      <AiFillStar className="text-[#ECB43C] text-lg" />
                      <span className="text-[#666666] text-xs ml-1">
                        {(typeof book.rating === "number"
                          ? book.rating
                          : 0
                        ).toFixed(1)}
                      </span>
                      <span className="text-[#666666] text-xs ml-1">
                        ({ratingCount} reviews)
                      </span>
                    </div> */}

                    <div className="text-[#666666] text-xs">
                      Borrowed:{" "}
                      <span className="font-bold">
                        {book.total_borrow ?? 0}
                      </span>{" "}
                      times
                    </div>
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
                          `/staff/dashboard/book-management/catalog?theme=${encodeURIComponent(
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
                        {copies.map((copyItem, idx) => (
                          <option
                            key={copyItem.id}
                            value={idx}
                            className="rounded-full text-xs"
                            disabled={copyItem.dynamic_status !== "Available"}
                          >
                            {`Copy ${copyItem.copy} - ${
                              copyItem.condition || "Not specified"
                            } (${
                              copyItem.dynamic_status || copyItem.status || "-"
                            })`}
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
                      <span className="text-black font-medium">Condition</span>
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
                    const copyItem = copies[selectedCopyIndex] || {};
                    let badgeClass =
                      "px-2 py-1 rounded-full text-xs font-medium ";
                    const condition = (copyItem.condition || "").toLowerCase();
                    if (
                      condition === "not specified" ||
                      condition === "not_specified"
                    ) {
                      badgeClass += "bg-yellow-100 text-yellow-800";
                    } else if (condition === "pristine") {
                      badgeClass += "bg-green-100 text-green-800";
                    } else if (condition === "good") {
                      badgeClass += "bg-blue-100 text-blue-800";
                    } else if (condition === "fair") {
                      badgeClass += "bg-orange-100 text-orange-800";
                    } else {
                      badgeClass += "bg-gray-200 text-gray-800";
                    }
                    return (
                      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                        <div>
                          <span className="text-black font-medium">
                            Condition
                          </span>
                        </div>
                        <div>
                          <span className={badgeClass}>
                            {copyItem.condition || "Not specified"}
                          </span>
                        </div>
                        <div>
                          <span className="text-black font-medium">
                            Description
                          </span>
                        </div>
                        <div className="text-black">
                          {copyItem.comment || "No description available"}
                        </div>
                        <div>
                          <span className="text-black font-medium">
                            Last Updated
                          </span>
                        </div>
                        <div className="text-black">
                          {copyItem.updated_at
                            ? new Date(copyItem.updated_at).toLocaleString()
                            : "Not available"}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Tabs */}
              <div className="border-b border-[#767676]/40 mt-4">
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
              <div className="mb-6">
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
                <div className="w-2 h-2 bg-[#c3efc3] rounded-full" />
                <span className="text-black text-xs font-normal">
                  Available now
                </span>
                <span className="text-black text-xs font-normal ml-auto">
                  Stok: <span className="font-bold">{book.stock ?? 0}</span>
                </span>
              </div>

              <div className="space-y-3 mt-6">
                <Link
                  href={`/staff/dashboard/book-management/edit-book?id=${bookId}`}
                >
                  <button className="w-full h-[35px] bg-[#2e3105] text-white text-xs rounded-2xl">
                    Edit
                  </button>
                </Link>
                <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full h-[35px] border border-red-500 text-red-500 text-xs rounded-2xl hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default DetailStaff;
