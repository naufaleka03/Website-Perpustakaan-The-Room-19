"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/supabase/client";
import { FaPlus } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";

const bookTypes = ["Local Books", "International Books"];
const contentTypes = ["Fiction", "Nonfiction"];
const languages = ["Indonesian", "English", "Chinese", "Japanese", "More"];
const coverTypes = ["Hardcover", "Paperback", "E-Book"];
const usageOptions = ["On-site Only", "On-site Only and For Rent"];

// Add this component before the main EditBook component
function EditBookSkeleton() {
  const skeletonClass = "bg-[#f0f0f0] relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[#f8f8f8] before:to-transparent";

  return (
    <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
      <div className="w-full h-full relative bg-white p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className={`h-8 ${skeletonClass} rounded w-1/4 mb-6`}></div>
          
          <div className="flex gap-8">
            {/* Left side - Book Cover Upload Skeleton */}
            <div className="w-[200px] flex flex-col">
              <div className="w-[200px] h-[280px] rounded-2xl overflow-hidden border border-[#cdcdcd] flex-shrink-0 bg-white p-2">
                <div className={`w-full h-full ${skeletonClass} rounded-lg`}></div>
              </div>
              <div className={`mt-2 ${skeletonClass} rounded-lg h-[80px] w-full`}></div>
            </div>

            {/* Right side - Book Form Skeleton */}
            <div className="flex-1 space-y-4">
              {/* Book Details Section */}
              <div className="bg-white rounded-xl p-6 border border-[#cdcdcd]/50">
                <div className={`h-6 ${skeletonClass} rounded w-1/4 mb-4`}></div>
                
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <div className={`h-4 ${skeletonClass} rounded w-1/6 mb-2`}></div>
                    <div className={`h-[35px] ${skeletonClass} rounded-lg w-full`}></div>
                  </div>

                  {/* Book Type Fields */}
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i}>
                        <div className={`h-4 ${skeletonClass} rounded w-1/6 mb-2`}></div>
                        <div className={`h-[35px] ${skeletonClass} rounded-lg w-full`}></div>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <div>
                    <div className={`h-4 ${skeletonClass} rounded w-1/6 mb-2`}></div>
                    <div className={`h-[100px] ${skeletonClass} rounded-lg w-full`}></div>
                  </div>

                  {/* Themes */}
                  <div>
                    <div className={`h-4 ${skeletonClass} rounded w-1/6 mb-2`}></div>
                    <div className="flex gap-2 mb-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-[30px] ${skeletonClass} rounded-full w-[100px]`}></div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <div className={`h-[35px] ${skeletonClass} rounded-lg flex-1`}></div>
                      <div className={`h-[35px] ${skeletonClass} rounded-lg w-[80px]`}></div>
                    </div>
                  </div>

                  {/* Usage and Price */}
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                      <div key={i}>
                        <div className={`h-4 ${skeletonClass} rounded w-1/4 mb-2`}></div>
                        <div className={`h-[35px] ${skeletonClass} rounded-lg w-full`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Book Metadata Section */}
              <div className="bg-white rounded-xl p-6 border border-[#cdcdcd]/50">
                <div className={`h-6 ${skeletonClass} rounded w-1/4 mb-4`}></div>
                
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i}>
                      <div className={`h-4 ${skeletonClass} rounded w-1/6 mb-2`}></div>
                      <div className={`h-[35px] ${skeletonClass} rounded-lg w-full`}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <div className={`h-[40px] ${skeletonClass} rounded-3xl w-[100px]`}></div>
                <div className={`h-[40px] ${skeletonClass} rounded-3xl w-[100px]`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const EditBook = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get("id");
  const supabase = createClient();

  const [formData, setFormData] = useState({
    book_title: "",
    isbn_code: "",
    language: "",
    author: "",
    publisher: "",
    cover_type: "",
    usage: "",
    price: "",
    published_year: "",
    description: "",
    book_type: "",
    content_type: "",
    genre: "",
    cover_image: "",
    rating: 0,
  });

  const [themes, setThemes] = useState([]);
  const [themeInput, setThemeInput] = useState('');
  const [genres, setGenres] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch genres from database
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const { data, error } = await supabase.from('genres').select('genre_name');
        if (error) throw error;
        
        if (data && data.length > 0) {
          const genreNames = data.map(genre => genre.genre_name);
          setGenres(genreNames);
        }
      } catch (error) {
        console.error('Error fetching genres:', error.message);
      }
    };
    
    fetchGenres();
  }, []);

  // If usage is "On-site Only", set price to "On-site Only"
  useEffect(() => {
    if (formData.usage === "On-site Only") {
      setFormData(prev => ({
        ...prev,
        price: "0" // Set price to 0 for on-site only
      }));
    }
  }, [formData.usage]);

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
        if (data.book) {
          // Ensure no select value is null
          const safeBook = { ...data.book };
          [
            'book_type',
            'content_type',
            'genre',
            'language',
            'cover_type',
            'usage',
          ].forEach((key) => {
            if (safeBook[key] === null) safeBook[key] = '';
          });
          setFormData(safeBook);
          setSelectedImage(data.book.cover_image);
          
          // Set themes if they exist
          if (data.book.themes && Array.isArray(data.book.themes)) {
            setThemes(data.book.themes);
          }
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, or WebP)');
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For numeric fields, prevent negative values
    if (name === "price" || name === "published_year") {
      const numValue = parseFloat(value);
      if (numValue < 0) return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const uploadCoverImage = async (file) => {
    if (!file) return null;
    
    try {
      // Create a unique file name to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `public/${fileName}`;
      
      console.log('Attempting to upload to:', 'book-covers/' + filePath);
      console.log('File type:', file.type, 'File size:', file.size);
      
      // Upload the image to Supabase Storage
      const { data, error } = await supabase.storage
        .from('book-covers')
        .upload(filePath, file);
      
      if (error) {
        console.error('Error uploading cover image:', error);
        throw error;
      }
      
      console.log('Upload successful:', data);
      
      // Get the public URL using Supabase's method
      const { data: urlData } = supabase.storage
        .from('book-covers')
        .getPublicUrl(filePath);
        
      console.log('Generated public URL:', urlData.publicUrl);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadCoverImage:', error);
      throw error;
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields based on the new requirements
    if (!formData.book_title.trim()) {
      errors.book_title = "Book title is required";
    }
    
    if (!formData.usage) {
      errors.usage = "Usage is required";
    }
    
    if (formData.usage !== "On-site Only" && !formData.price) {
      errors.price = "Price is required for rentable books";
    }
    
    if (!formData.author.trim()) {
      errors.author = "Author name is required";
    }
    
    if (!formData.publisher.trim()) {
      errors.publisher = "Publisher name is required";
    }
    
    // Validate price format if provided
    if (formData.price) {
      const price = parseFloat(formData.price);
      if (isNaN(price)) {
        errors.price = "Please enter a valid price";
      }
      if (price < 0) {
        errors.price = "Price cannot be negative";
      }
      if (price > 99999999.99) {
        errors.price = "Price must be less than 100,000,000";
      }
    }

    // Validate published year if provided
    if (formData.published_year) {
      const year = parseInt(formData.published_year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1000 || year > currentYear) {
        errors.published_year = `Published year must be between 1000 and ${currentYear}`;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleThemeSubmit = (e) => {
    e.preventDefault();
    if (themeInput.trim() && !themes.includes(themeInput.trim())) {
      setThemes([...themes, themeInput.trim()]);
      setThemeInput('');
    }
  };

  const removeTheme = (themeToRemove) => {
    setThemes(themes.filter(theme => theme !== themeToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setLoading(true);
      
      // Validate form
      if (!validateForm()) {
        setError("Please fix the highlighted errors before submitting");
        setLoading(false);
        return;
      }
      
      // Upload new cover image if one is selected
      let coverImageUrl = formData.cover_image;
      if (imageFile) {
        coverImageUrl = await uploadCoverImage(imageFile);
      }

      const updatedData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        published_year: parseInt(formData.published_year) || null,
        cover_image: coverImageUrl,
        themes: themes
      };

      const response = await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update book');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/staff/dashboard/book-management/catalog');
      }, 2000);
    } catch (err) {
      console.error('Error updating book:', err);
      setError('Failed to update book. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Update the loading state to use the skeleton
  if (loading && !formData.book_title) {
    return <EditBookSkeleton />;
  }

  if (error && !formData.book_title) {
    return (
      <div className="flex-1 min-h-[calc(100vh-72px)] bg-white flex flex-col justify-center items-center">
        <p className="text-red-500 mb-4">{error}</p>
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
      <div className="w-full h-full relative bg-white p-8">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-2xl font-semibold text-[#111010] mb-6">Edit Book</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
              Book updated successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-8">
            {/* Left side - Book Cover Upload */}
            <div className="w-[200px] flex flex-col">
              <div className="relative w-[200px] h-[280px] rounded-2xl overflow-hidden border border-[#cdcdcd] flex-shrink-0 bg-white p-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="coverUpload"
              />
              <label
                htmlFor="coverUpload"
                className="w-full h-full flex items-center justify-center cursor-pointer"
              >
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Book Cover Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center bg-[#f2f2f2] w-full h-full">
                    <FaPlus className="text-[#666666] text-xl mb-1" />
                    <span className="text-[#666666] text-xs">Upload Cover</span>
                  </div>
                )}
              </label>
            </div>
              <div className="mt-2 text-xs text-[#666666] bg-white p-3 border border-[#cdcdcd]/50 rounded-lg">
                <p>Book cover image should be clear and representative of the book content.</p>
                <p className="mt-1">Accepted formats: JPEG, PNG, WebP</p>
                <p className="mt-1">Maximum size: 5MB</p>
              </div>
            </div>

            {/* Right side - Book Form */}
            <div className="flex-1 space-y-4">

              {/* Book Details Section */}
              <div className="bg-white rounded-xl p-6 border border-[#cdcdcd]/50">
                <h2 className="text-lg font-semibold text-[#111010] mb-4">
                  Book Details
                </h2>

                <div className="space-y-4">
              <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">
                      Title
                </label>
                <input
                  type="text"
                  name="book_title"
                  value={formData.book_title}
                      onChange={handleInputChange}
                      placeholder="Enter the book title"
                      className={`w-full h-[35px] rounded-lg border ${formErrors.book_title ? 'border-red-500' : 'border-[#666666]/30'} px-4 text-sm text-[#666666] transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none`}
                    />
                    {formErrors.book_title ? (
                      <p className="text-red-500 text-xs mt-1">{formErrors.book_title}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Enter the complete book title as it appears on the cover.</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#666666] mb-1">
                        Origin
                      </label>
                      <div className="relative group">
                        <select 
                          name="book_type"
                          value={formData.book_type}
                          onChange={handleInputChange}
                          className={`w-full h-[35px] rounded-lg border ${formErrors.book_type ? 'border-red-500' : 'border-[#666666]/30'} px-4 pr-8 text-sm text-[#666666] appearance-none bg-white transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none`}
                        >
                          <option value="">Select book origin</option>
                          {bookTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666] transition-transform duration-300 group-hover:text-[#2e3105] group-focus-within:rotate-180">
                          <IoIosArrowDown size={16} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Select whether the book is local or international.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#666666] mb-1">
                        Content Type
                      </label>
                      <div className="relative group">
                        <select 
                          name="content_type"
                          value={formData.content_type}
                          onChange={handleInputChange}
                          className={`w-full h-[35px] rounded-lg border ${formErrors.content_type ? 'border-red-500' : 'border-[#666666]/30'} px-4 pr-8 text-sm text-[#666666] appearance-none bg-white transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none`}
                        >
                          <option value="">Select content type</option>
                          {contentTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666] transition-transform duration-300 group-hover:text-[#2e3105] group-focus-within:rotate-180">
                          <IoIosArrowDown size={16} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Categorize if the book is fiction or non-fiction.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#666666] mb-1">
                        Genre/Category
                      </label>
                      <div className="relative group">
                        <select 
                          name="genre"
                          value={formData.genre}
                          onChange={handleInputChange}
                          className={`w-full h-[35px] rounded-lg border ${formErrors.genre ? 'border-red-500' : 'border-[#666666]/30'} px-4 pr-8 text-sm text-[#666666] appearance-none bg-white transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none`}
                        >
                          <option value="">Select a genre</option>
                          {genres.map((genre) => (
                            <option key={genre} value={genre}>{genre}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666] transition-transform duration-300 group-hover:text-[#2e3105] group-focus-within:rotate-180">
                          <IoIosArrowDown size={16} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Select the book's specific genre or category.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#666666] mb-1">
                        Language
                      </label>
                      <div className="relative group">
                        <select 
                          name="language"
                          value={formData.language}
                          onChange={handleInputChange}
                          className={`w-full h-[35px] rounded-lg border ${formErrors.language ? 'border-red-500' : 'border-[#666666]/30'} px-4 pr-8 text-sm text-[#666666] appearance-none bg-white transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none`}
                        >
                          <option value="">Select a language</option>
                          {languages.map((language) => (
                            <option key={language} value={language}>{language}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666] transition-transform duration-300 group-hover:text-[#2e3105] group-focus-within:rotate-180">
                          <IoIosArrowDown size={16} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Select the primary language of the book.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">
                      Cover Type
                    </label>
                    <div className="relative group">
                      <select 
                        name="cover_type"
                        value={formData.cover_type}
                        onChange={handleInputChange}
                        className={`w-full h-[35px] rounded-lg border ${formErrors.cover_type ? 'border-red-500' : 'border-[#666666]/30'} px-4 pr-8 text-sm text-[#666666] appearance-none bg-white transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none`}
                      >
                        <option value="">Select cover type</option>
                        {coverTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666] transition-transform duration-300 group-hover:text-[#2e3105] group-focus-within:rotate-180">
                        <IoIosArrowDown size={16} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Specify whether the book is hardcover, paperback, or e-book.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Write a brief description"
                      className="w-full h-[100px] rounded-lg border border-[#666666]/30 px-4 py-2 text-sm text-[#666666] resize-none transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Provide a brief summary or description of the book.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">
                      Themes
                    </label>
                    <div className="space-y-2">
                      {themes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {themes.map((theme) => (
                            <div
                              key={theme}
                              className="flex items-center gap-1 bg-[#2e3105]/10 px-2 py-1 rounded-full text-sm text-[#666666]"
                            >
                              <span>{theme}</span>
                              <button
                                type="button"
                                onClick={() => removeTheme(theme)}
                                className="text-[#666666] hover:text-[#2e3105]"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={themeInput}
                          onChange={(e) => setThemeInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleThemeSubmit(e)}
                          placeholder="Add a theme and press Enter"
                          className="flex-1 h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666] transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleThemeSubmit}
                          className="h-[35px] bg-[#2e3105] text-white rounded-lg px-3 text-sm transition-all duration-300 hover:bg-[#3e4310]"
                        >
                          Add
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Add themes that represent this book. Press Enter or click Add after each theme.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#666666] mb-1">
                        Usage
                      </label>
                      <div className="relative group">
                        <select 
                          name="usage"
                          value={formData.usage}
                          onChange={handleInputChange}
                          className={`w-full h-[35px] rounded-lg border ${formErrors.usage ? 'border-red-500' : 'border-[#666666]/30'} px-4 pr-8 text-sm text-[#666666] appearance-none bg-white transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none`}
                        >
                          <option value="">Select usage</option>
                          {usageOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666] transition-transform duration-300 group-hover:text-[#2e3105] group-focus-within:rotate-180">
                          <IoIosArrowDown size={16} />
                        </div>
                      </div>
                      {formErrors.usage ? (
                        <p className="text-red-500 text-xs mt-1">{formErrors.usage}</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">Specify if the book is for on-site use only or available for rent.</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#666666] mb-1">
                        Price (in IDR)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter the price"
                        disabled={formData.usage === "On-site Only"}
                        min="0"
                        className={`w-full h-[35px] rounded-lg border ${formErrors.price ? 'border-red-500' : 'border-[#666666]/30'} px-4 text-sm text-[#666666] transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                      />
                      {formErrors.price ? (
                        <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
                      ) : formData.usage === "On-site Only" ? (
                        <p className="text-xs text-gray-500 mt-1">Price set to 0 for On-site Only books</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">Enter the rental price without commas or currency symbols.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Book Metadata Section */}
              <div className="bg-white rounded-xl p-6 border border-[#cdcdcd]/50">
                <h2 className="text-lg font-semibold text-[#111010] mb-4">
                  Book Metadata
                </h2>

                <div className="space-y-4">
              <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">
                  Author
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                      onChange={handleInputChange}
                      placeholder="Enter the author's name"
                      className={`w-full h-[35px] rounded-lg border ${formErrors.author ? 'border-red-500' : 'border-[#666666]/30'} px-4 text-sm text-[#666666] transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none`}
                    />
                    {formErrors.author ? (
                      <p className="text-red-500 text-xs mt-1">{formErrors.author}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Enter the full name of the book's author.</p>
                    )}
              </div>

              <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">
                  Publisher
                </label>
                <input
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                      onChange={handleInputChange}
                      placeholder="Enter the publisher's name"
                      className={`w-full h-[35px] rounded-lg border ${formErrors.publisher ? 'border-red-500' : 'border-[#666666]/30'} px-4 text-sm text-[#666666] transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none`}
                    />
                    {formErrors.publisher ? (
                      <p className="text-red-500 text-xs mt-1">{formErrors.publisher}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Enter the name of the book's publishing company.</p>
                    )}
              </div>

              <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">
                  Published Year
                </label>
                <input
                  type="number"
                  name="published_year"
                  value={formData.published_year}
                      onChange={handleInputChange}
                      placeholder="Enter the published year"
                      min="1000"
                      max={new Date().getFullYear()}
                      className={`w-full h-[35px] rounded-lg border ${formErrors.published_year ? 'border-red-500' : 'border-[#666666]/30'} px-4 text-sm text-[#666666] transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none`}
                    />
                    {formErrors.published_year ? (
                      <p className="text-red-500 text-xs mt-1">{formErrors.published_year}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Enter the year when the book was published (between 1000 and current year).</p>
                    )}
              </div>

              <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">
                      ISBN
                </label>
                <input
                  type="text"
                  name="isbn_code"
                  value={formData.isbn_code}
                      onChange={handleInputChange}
                      placeholder="Enter the ISBN code"
                      className={`w-full h-[35px] rounded-lg border ${formErrors.isbn_code ? 'border-red-500' : 'border-[#666666]/30'} px-4 text-sm text-[#666666] transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none`}
                    />
                    {formErrors.isbn_code ? (
                      <p className="text-red-500 text-xs mt-1">{formErrors.isbn_code}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Enter the International Standard Book Number if available.</p>
                    )}
              </div>

              </div>
            </div>

              <div className="flex justify-end gap-2">
              <Link href="/staff/dashboard/book-management/catalog">
                <button
                  type="button"
                    className="h-[40px] bg-white border border-[#2e3105] text-[#2e3105] rounded-3xl px-6 text-sm font-medium transition-all duration-300 hover:bg-[#2e3105]/5"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                  className="h-[40px] bg-[#2e3105] text-white rounded-3xl px-6 text-sm font-medium transition-all duration-300 hover:bg-[#3e4310]"
              >
                {loading ? 'Updating...' : 'Update Book'}
              </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBook; 