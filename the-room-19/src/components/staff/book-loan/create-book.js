"use client";

import { useState } from "react";
import { FaPlus } from "react-icons/fa";

const CreateBook = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
      <div className="w-full h-full relative bg-white">
        <div className="w-full mx-auto px-8 py-6">
          <div className="flex gap-6">
            {/* Left side - Book Cover Upload */}
            <div className="relative w-[180px] h-[250px] rounded-2xl overflow-hidden border border-[#cdcdcd]">
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
                  </div>
                )}
              </label>
            </div>

            {/* Right side - Book Form */}
            <div className="flex-1 bg-white rounded-[15px] border border-[#777777]/50 p-4">
              {/* Book Details Section */}
              <div className="mb-6">
                <h2 className="text-black text-lg font-semibold font-manrope mb-4">
                  Book Details
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="text-black text-xs font-medium font-manrope block mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter the book title"
                      className="w-full h-[40px] bg-[#f2f2f2] rounded-xl border border-[#cdcdcd] px-3 text-xs text-[#666666]"
                    />
                  </div>

                  <div>
                    <label className="text-black text-xs font-medium font-manrope block mb-1">
                      Type of book
                    </label>
                    <select className="w-full h-[40px] bg-[#f2f2f2] rounded-xl border border-[#cdcdcd] px-3 text-xs text-[#666666]">
                      <option value="">Select the type of book</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-black text-xs font-medium font-manrope block mb-1">
                      Genre
                    </label>
                    <select className="w-full h-[40px] bg-[#f2f2f2] rounded-xl border border-[#cdcdcd] px-3 text-xs text-[#666666]">
                      <option value="">Select a genre</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-black text-xs font-medium font-manrope block mb-1">
                      Description
                    </label>
                    <textarea
                      placeholder="Write a brief description"
                      className="w-full h-[85px] bg-[#f2f2f2] rounded-xl border border-[#cdcdcd] px-3 py-2 text-xs text-black resize-none"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-[#767676]/40 my-4" />

              {/* Book Metadata Section */}
              <div>
                <h2 className="text-black text-lg font-semibold font-manrope mb-4">
                  Book Metadata
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="text-black text-xs font-medium font-manrope block mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      placeholder="Enter the author's name"
                      className="w-full h-[40px] bg-[#f2f2f2] rounded-xl border border-[#cdcdcd] px-3 text-xs text-[#666666]"
                    />
                  </div>

                  <div>
                    <label className="text-black text-xs font-medium font-manrope block mb-1">
                      Publisher
                    </label>
                    <input
                      type="text"
                      placeholder="Enter the publisher's name"
                      className="w-full h-[40px] bg-[#f2f2f2] rounded-xl border border-[#cdcdcd] px-3 text-xs text-[#666666]"
                    />
                  </div>

                  <div>
                    <label className="text-black text-xs font-medium font-manrope block mb-1">
                      Published year
                    </label>
                    <input
                      type="text"
                      placeholder="Enter the published year"
                      className="w-full h-[40px] bg-[#f2f2f2] rounded-xl border border-[#cdcdcd] px-3 text-xs text-[#666666]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-black text-xs font-medium font-manrope block mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  placeholder="Enter the ISBN code"
                  className="w-full h-[40px] bg-[#f2f2f2] rounded-xl border border-[#cdcdcd] px-3 text-xs text-[#666666] mb-3"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBook;
