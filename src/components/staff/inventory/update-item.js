"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/app/supabase/client";

export default function UpdateItem() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("id");
  const supabase = createClient();
  const [item_name, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [item_image, setItemImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          setError("Failed to fetch categories");
        }
      } catch (error) {
        setError("Error loading categories");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch existing item data
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/inventory/${itemId}`);
        const data = await response.json();

        if (data.success) {
          const item = data.data;
          setItemName(item.item_name);
          setDescription(item.description || "");
          setPrice(item.price?.toString() || "");
          setCurrentImage(item.item_image);
          setImagePreview(item.item_image);
          setSelectedCategory(item.category_id || "");
        } else {
          setError("Failed to fetch item data");
        }
      } catch (error) {
        setError("Error loading item data");
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should not exceed 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      setItemImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setError(""); // Clear any previous errors
    }
  };

  const uploadItemImage = async (file) => {
    if (!file) return currentImage; // Return existing image URL if no new image

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;
      const filePath = `inventory/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("inventory-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload image");
      }

      if (!data?.path) {
        throw new Error("No upload data received");
      }

      const { data: urlData, error: urlError } = await supabase.storage
        .from("inventory-images")
        .getPublicUrl(data.path);

      if (urlError) {
        throw new Error(urlError.message || "Failed to get image URL");
      }

      return urlData.publicUrl;
    } catch (error) {
      throw new Error(error.message || "Failed to process image upload");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate form
      if (!item_name.trim()) {
        throw new Error("Item name is required");
      }
      if (!price || isNaN(parseFloat(price))) {
        throw new Error("Valid price is required");
      }

      let imageUrl = currentImage;
      if (item_image) {
        try {
          imageUrl = await uploadItemImage(item_image);
        } catch (uploadError) {
          setError(uploadError.message || "Failed to upload image");
          setIsSubmitting(false);
          return;
        }
      }

      const formData = {
        item_name: item_name.trim(),
        description: description.trim(),
        price: parseFloat(price.replace(/[^0-9.]/g, "")),
        item_image: imageUrl,
        category_id: selectedCategory,
      };

      const response = await fetch(`/api/inventory/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        router.push("/staff/dashboard/inventory/inventory-list");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to update item");
      }
    } catch (err) {
      console.error("Error updating item:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skeleton loader
  if (isLoading) {
    return (
      <div className="w-full min-h-screen mx-auto bg-gradient-to-br from-[#232310] to-[#5f5f2c] px-0 pb-20">
        {/* Hero Section Skeleton */}
        <div className="relative mb-8 mt-0">
          <div className="w-full h-[360px] relative bg-gradient-to-br from-[#232310] to-[#5f5f2c]">
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#232310] pointer-events-none"></div>
            <div className="absolute inset-x-0 top-0 flex items-start w-full mx-auto px-4 lg:px-8 pt-16">
              <div className="max-w-[1200px] mx-auto w-full">
                <div className="h-10 w-2/3 bg-gray-300/60 rounded mb-4 animate-pulse"></div>
                <div className="h-6 w-1/2 bg-gray-300/40 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Card Overlay Skeleton */}
        <div className="relative z-10 max-w-[1000px] mx-auto px-6 lg:px-8 mb-12" style={{ marginTop: '-180px' }}>
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded mb-4"></div>
            <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-8"></div>
            {/* Skeleton for form fields */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="mb-6">
                <div className="h-4 w-1/4 bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-10 w-full bg-gray-100 animate-pulse rounded mb-2"></div>
                <div className="h-3 w-1/3 bg-gray-100 animate-pulse rounded"></div>
              </div>
            ))}
            {/* Skeleton for image preview */}
            <div className="mb-6">
              <div className="h-4 w-1/4 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-32 w-32 bg-gray-100 animate-pulse rounded-lg mb-2"></div>
              <div className="h-3 w-1/3 bg-gray-100 animate-pulse rounded"></div>
            </div>
            {/* Skeleton for submit button */}
            <div className="h-12 w-full bg-gray-300 animate-pulse rounded-3xl mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen mx-auto bg-gradient-to-br from-[#232310] to-[#5f5f2c] px-0 pb-20">
      {/* Hero Section */}
      <div className="relative mb-8 mt-0">
        <div className="w-full h-[360px] relative">
          <img src="/navigation/inventory.jpg" alt="Inventory Hero" className="w-full h-full object-cover rounded-none" />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#232310] pointer-events-none"></div>
          <div className="absolute inset-x-0 top-0 flex items-start w-full mx-auto px-4 lg:px-8 pt-16">
            <div className="max-w-[1200px] mx-auto w-full">
              <h1 className="text-[#fcfcfc] text-4xl font-medium leading-[44px] font-manrope">
                UPDATE ITEM
              </h1>
              <p className="text-[#fcfcfc]/80 max-w-xl font-manrope">
                Update an inventory item in The Room 19 Library collection.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Form Section */}
      <div className="relative z-10 max-w-[1000px] mx-auto px-6 lg:px-8 mb-12" style={{ marginTop: '-180px' }}>
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          {/* Keep the form content and logic unchanged */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Item Name */}
            <div className="space-y-1">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Item Name
              </label>
              <input
                type="text"
                value={item_name}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter Item Name"
                className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the name of the item.
              </p>
            </div>
            {/* Description */}
            <div className="space-y-1">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter Description"
                className="w-full rounded-lg border border-[#666666]/30 px-4 py-2 text-sm font-normal font-['Poppins'] text-[#666666] min-h-[100px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a brief description of the item.
              </p>
            </div>
            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select the category for this item.
              </p>
            </div>
            {/* Price */}
            <div className="space-y-1">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Price
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter Price"
                className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the price of the item (in IDR).
              </p>
            </div>
            {/* Upload Item Image */}
            <div className="space-y-1">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Upload Item Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="absolute opacity-0 w-full h-full cursor-pointer"
                  accept="image/*"
                />
                <div className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 flex items-center">
                  <span
                    className={`text-sm font-normal font-['Poppins'] ${
                      item_image ? "text-[#666666]" : "text-[#A9A9A9]"
                    }`}
                  >
                    {item_image ? item_image.name : "Choose file or drop here"}
                  </span>
                </div>
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Upload an image of the item. Max size: 5MB.
              </p>
            </div>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`h-[45px] w-full bg-[#2e3105] text-white rounded-3xl text-base font-semibold font-manrope flex items-center justify-center gap-2 transition mt-6 ${
                isSubmitting ? 'opacity-75' : 'hover:bg-[#404615]'
              }`}
            >
              {isSubmitting ? "UPDATING..." : "UPDATE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
