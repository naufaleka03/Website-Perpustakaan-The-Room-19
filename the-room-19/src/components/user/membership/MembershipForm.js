 "use client"
import { Manrope } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export default function MembershipForm() {
  return (
    <div className="max-w-[1440px] min-h-[850px] mx-auto bg-white px-0 pb-20">
      {/* Hero Section */}
      <div className="relative mb-4 mt-0">
        <img 
          className="w-full h-[200px] object-cover" 
          src="/your-image.jpg"
          alt="Membership banner"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#4d4d4d] to-black w-full">
          <h1 className={`text-[#fcfcfc] text-5xl font-medium leading-[48px] p-8 ${manrope.className}`}>
            MEMBERSHIP
          </h1>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex flex-col gap-4 max-w-[1200px] mx-10 px-6">
        {/* Personal Information */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Full Name
          </label>
          <input 
            type="text"
            className="h-[35px] w-full rounded-2xl border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
            placeholder="Enter your full name"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Email
          </label>
          <input 
            type="email"
            className="h-[35px] w-full rounded-2xl border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Phone Number
          </label>
          <input 
            type="tel"
            className="h-[35px] w-full rounded-2xl border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
            placeholder="Enter your phone number"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Domicile
          </label>
          <input 
            type="text"
            className="h-[35px] w-full rounded-2xl border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
            placeholder="Enter your domicile"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Favorite Book Genre
          </label>
          <input 
            type="text"
            className="h-[35px] w-full rounded-2xl border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
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
              className="h-[35px] w-1/2 rounded-2xl border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
              placeholder="Contact name"
            />
            <input 
              type="tel"
              className="h-[35px] w-1/2 rounded-2xl border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
              placeholder="Contact number"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Upload ID Card
          </label>
          <div className="h-[35px] w-full rounded-2xl border border-[#666666]/30 px-4 flex items-center text-sm text-[#666666]/80">
            <span>Choose file or drop here</span>
            <input type="file" className="hidden" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input type="checkbox" className="rounded" />
          <span className="text-sm text-[#666666]">
            I have read and <span className="font-medium">agree</span> to the terms and conditions.
          </span>
        </div>

        {/* Submit Button */}
        <button className={`h-[40px] bg-[#111010] rounded-2xl text-white text-base font-semibold mt-[20px] ${manrope.className}`}>
          SUBMIT
        </button>
      </div>
    </div>
  );
}
  