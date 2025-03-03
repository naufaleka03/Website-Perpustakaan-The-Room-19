"use client"
import { useState } from 'react';
import { GoTriangleDown } from 'react-icons/go';
import { IoCalendarOutline } from "react-icons/io5";
import { FaUser, FaUsers, FaPlus, FaTrash } from "react-icons/fa";
import { Manrope } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export default function CreateEvent() {
  const [activityName, setActivityName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [shift, setShift] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [feeTicket, setFeeTicket] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [poster, setPoster] = useState(null);

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate) {
      const [year, month, day] = inputDate.split('-');
      setDate(`${day}/${month}/${year}`);
    } else {
      setDate('');
    }
  };

  const handlePosterUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPoster(file);
    }
  };

  return (
    <div className="w-full min-h-screen mx-auto bg-white px-0 pb-20">
      {/* Hero Section */}
      <div className="relative mb-4 mt-0">
        <img 
          className="w-full h-[200px] object-cover" 
          src="https://via.placeholder.com/1402x272" 
          alt="Reservation banner"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#4d4d4d] to-black w-full mx-auto px-4 lg:px-8">
          <h1 className={`text-[#fcfcfc] text-5xl font-medium leading-[48px] p-8 ${manrope.className}`}>
            CREATE <br/>EVENT
          </h1>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex justify-center flex-col gap-4 max-w-[1200px] mx-auto px-16 lg:px-20 overflow-x-auto">
        {/* Activity Name */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Activity Name
          </label>
          <input
            type="text"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            placeholder="Enter Activity Name"
            className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter Event Description"
            className="w-full rounded-lg border border-[#666666]/30 px-4 py-2 text-sm font-normal font-['Poppins'] text-[#666666] min-h-[100px]"
          />
        </div>

        {/* Date */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Date
          </label>
          <div className="relative">
            <input 
              type="date"
              onChange={handleDateChange}
              className="absolute opacity-0 w-full h-full cursor-pointer"
            />
            <div className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 flex items-center">
              <span className={`text-sm font-normal font-['Poppins'] ${date ? 'text-[#666666]' : 'text-[#A9A9A9]'}`}>
                {date || 'Choose date'}
              </span>
              <IoCalendarOutline className="absolute right-6 top-1/2 -translate-y-1/2 text-[#666666] text-2xl" />
            </div>
          </div>
        </div>

        {/* Shift */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Shift
          </label>
          <div className="relative">
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] appearance-none"
            >
              <option value="" className="text-[#666666]/40">Choose shift</option>
              <option value="morning" className="text-[#666666]">Morning</option>
              <option value="afternoon" className="text-[#666666]">Afternoon</option>
              <option value="evening" className="text-[#666666]">Evening</option>
            </select>
            <GoTriangleDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#666666] text-2xl pointer-events-none" />
          </div>
        </div>

        {/* Maximum Participants */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Maximum Participants
          </label>
          <input
            type="number"
            value={maxParticipants}
            placeholder="Enter Maximum Number of Participants"
            onChange={(e) => setMaxParticipants(e.target.value)}
            className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
          />
        </div>

        {/* Fee Ticket */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Fee Ticket
          </label>
          <input
            type="text"
            value={feeTicket}
            placeholder="Enter Fee Ticket"
            onChange={(e) => setFeeTicket(e.target.value)}
            className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
          />
        </div>

        {/* Additional Notes */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Additional Notes
          </label>
          <textarea
            value={additionalNotes}
            placeholder="Add Some Addtional Notes"
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full rounded-lg border border-[#666666]/30 px-4 py-2 text-sm font-normal font-['Poppins'] text-[#666666] min-h-[100px]"
          />
        </div>

        {/* Upload Activity Poster */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Upload Activity Poster
          </label>
          <input
            type="file"
            onChange={handlePosterUpload}
            className="w-full text-sm font-normal font-['Poppins'] text-[#666666]"
            accept="image/*"
          />
        </div>

        {/* Submit Button */}
        <button className={`h-[40px] bg-[#111010] rounded-3xl text-white text-base font-semibold mt-[20px] ${manrope.className}`}>
          SUBMIT
        </button>
      </div>
    </div>
  );
} 