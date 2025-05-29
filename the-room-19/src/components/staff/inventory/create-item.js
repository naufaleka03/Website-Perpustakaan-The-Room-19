"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitInventoryItem } from "@/app/lib/actions";
import { createClient } from "@/app/supabase/client";

export default function CreateItem() {
  const router = useRouter();
  const supabase = createClient();
  const [item_name, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [item_image, setItemImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    }
  };

  const uploadItemImage = async (file) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { data, error } = await supabase.storage
        .from("inventory-images")
        .upload(filePath, file);

      if (error) {
        console.error("Error uploading item image:", error);
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from("inventory-images")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error in uploadItemImage:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      let imageUrl = null;
      if (item_image) {
        try {
          imageUrl = await uploadItemImage(item_image);
        } catch (uploadError) {
          setError(
            "Failed to upload image. Please try again with a different image."
          );
          setIsSubmitting(false);
          return;
        }
      }

      const formData = {
        item_name,
        description,
        price: parseFloat(price.replace(/[^0-9.]/g, "")),
        item_image: imageUrl,
        stock_quantity: 0, // Default value for new items
      };

      const result = await submitInventoryItem(formData);

      if (result.success) {
        router.push("/staff/dashboard/inventory/manage-inventory");
        router.refresh();
      } else {
        setError(result.error || "Failed to create item");
      }
    } catch (err) {
      console.error("Error submitting item:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-h-screen mx-auto bg-white px-0 pb-20"
    >
      {/* Hero Section */}
      <div className="relative mb-4 mt-0">
        <img
          className="w-full h-[200px] object-cover"
          src="https://via.placeholder.com/1402x272"
          alt="Inventory banner"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#4d4d4d] to-black w-full mx-auto px-4 lg:px-8">
          <h1
            className={`text-[#fcfcfc] text-5xl font-medium leading-[48px] p-8 font-manrope`}
          >
            ADD NEW <br />
            ITEM
          </h1>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex justify-center flex-col gap-4 max-w-[1200px] mx-auto px-16 lg:px-20 overflow-x-auto">
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
          <p className="text-xs text-gray-500 mt-1">
            Upload an image of the item. Max size: 5MB.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-[40px] bg-[#111010] rounded-3xl text-white text-base font-semibold mt-[20px] font-manrope"
        >
          {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
        </button>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </form>
  );
}
