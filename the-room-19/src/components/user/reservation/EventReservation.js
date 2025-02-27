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

export default function EventReservation() {
  const [date, setDate] = useState('');
  const [reservationType, setReservationType] = useState('individual');
  const [members, setMembers] = useState(['']);

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate) {
      const [year, month, day] = inputDate.split('-');
      setDate(`${day}/${month}/${year}`);
    } else {
      setDate('');
    }
  };

  const addMember = () => {
    setMembers([...members, '']);
  };

  const removeMember = (index) => {
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
  };

  const handleMemberChange = (index, value) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  return (
    <div className="max-w-[1440px] min-h-[850px] mx-auto bg-white px-0 pb-20">
      {/* Hero Section */}
      <div className="relative mb-4 mt-0">
        <img 
          className="w-full h-[200px] object-cover" 
          src="https://via.placeholder.com/1402x272" 
          alt="Reservation banner"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#4d4d4d] to-black w-full">
          <h1 className={`text-[#fcfcfc] text-5xl font-medium leading-[48px] p-8 ${manrope.className}`}>
            RESERVE <br/>AN EVENTS
          </h1>
        </div>
      </div>

      {/* Reservation Type Selector */}
      <div className="flex justify-center gap-4 max-w-[1200px] mx-auto mb-4">
        <button
          onClick={() => setReservationType('individual')}
          className={`flex items-center gap-2 px-3 py-1 rounded-xl transition-all text-sm ${
            reservationType === 'individual' 
              ? 'bg-[#111010] text-white' 
              : 'bg-white text-[#666666] border border-[#666666]/30'
          }`}
        >
          <FaUser size={14} />
          <span>Individual</span>
        </button>
        <button
          onClick={() => setReservationType('group')}
          className={`flex items-center gap-2 px-3 py-1 rounded-xl transition-all text-sm ${
            reservationType === 'group' 
              ? 'bg-[#111010] text-white' 
              : 'bg-white text-[#666666] border border-[#666666]/30'
          }`}
        >
          <FaUsers size={14} />
          <span>Group</span>
        </button>
      </div>

      {/* Form Section */}
      <div className="flex flex-col gap-4 max-w-[1200px] mx-10 px-6">
        {/* Auto Generated Fields - Disabled */}
        {['Activity Name', 'Description', 'Date', 'Shift', 'Fee Ticket', 'Additional Notes'].map((field) => (
          <div key={field} className="space-y-1">
            <label className="text-[#666666] text-sm font-medium font-['Poppins']">
              {field}
            </label>
            <input 
              type="text"
              disabled
              className="h-[35px] w-full rounded-2xl border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100"
              placeholder={`Auto generated ${field.toLowerCase()}`}
            />
          </div>
        ))}

        {/* Full Name Field */}
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

        {/* Group Members Section */}
        {reservationType === 'group' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Group Members
              </label>
              {members.map((member, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input 
                    type="text"
                    value={member}
                    onChange={(e) => handleMemberChange(index, e.target.value)}
                    className="h-[35px] flex-1 rounded-2xl border border-[#666666]/30 px-4 text-sm text-[#666666] font-normal font-['Poppins']"
                    placeholder={`Member ${index + 1} name`}
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="h-[40px] w-[40px] flex items-center justify-center rounded-2xl border border-[#666666]/30 text-[#666666]"
                    >
                      <FaTrash size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMember}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-[#666666]/30 text-[#666666]"
              >
                <FaPlus size={12} />
                <span>Add Member</span>
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button className={`h-[40px] bg-[#111010] rounded-2xl text-white text-base font-semibold mt-[20px] ${manrope.className}`}>
          SUBMIT
        </button>
      </div>
    </div>
  );
} 