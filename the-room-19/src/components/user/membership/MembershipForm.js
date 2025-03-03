"use client"
import { Manrope } from 'next/font/google';
import { useState } from 'react';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export default function MembershipForm() {
  const [file, setFile] = useState(null);

  return (
    <div className="w-full min-h-screen mx-auto bg-white px-0 pb-20">
      {/* Hero Section */}
      <div className="relative mb-4 mt-0">
        <img 
          className="w-full h-[200px] object-cover" 
          src="/your-image.jpg"
          alt="Membership banner"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#4d4d4d] to-black w-full mx-auto px-4 lg:px-8">
          <h1 className={`text-[#fcfcfc] text-5xl font-medium leading-[48px] p-8 ${manrope.className}`}>
            MEMBERSHIP
          </h1>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex justify-center flex-col gap-4 max-w-[1200px] mx-auto px-16 lg:px-20 overflow-x-auto">
        {/* Personal Information */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Full Name
          </label>
          <input 
            type="text"
            className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
            placeholder="Enter your full name"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Email
          </label>
          <input 
            type="email"
            className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Phone Number
          </label>
          <input 
            type="tel"
            className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
            placeholder="Enter your phone number"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Domicile
          </label>
          <input 
            type="text"
            className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
            placeholder="Enter your domicile"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Favorite Book Genre
          </label>
          <input 
            type="text"
            className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
            placeholder="Enter your favorite book genre"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Emergency Contact
          </label>
          <div className="flex gap-3">
            <input 
              type="text"
              className="h-[35px] w-1/2 rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
              placeholder="Contact name"
            />
            <input 
              type="tel"
              className="h-[35px] w-1/2 rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
              placeholder="Contact number"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Upload ID Card
          </label>
          <div className="relative">
            <input 
              type="file"
              id="idCardUpload"
              className="absolute opacity-0 w-full h-full cursor-pointer"
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                }
              }}
            />
            <div className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 flex items-center">
              <span className={`text-sm font-normal font-['Poppins'] ${file ? 'text-[#666666]' : 'text-[#A9A9A9]'}`}>
                {file ? file.name : 'Choose file or drop here'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input type="checkbox" className="rounded" />
          <span className="text-sm text-[#666666]">
            I have read and <span className="font-medium">agree</span> to the terms and conditions.
          </span>
        </div>

        {/* Submit Button */}
        <button className={`h-[40px] bg-[#111010] rounded-3xl text-white text-base font-semibold mt-[20px] ${manrope.className}`}>
          SUBMIT
        </button>
      </div>
    </div>
  );
}
  