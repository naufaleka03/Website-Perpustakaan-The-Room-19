"use client"
import { useState } from 'react';
import { GoTriangleDown } from 'react-icons/go';
import { IoCalendarOutline } from "react-icons/io5";
import { FaUser, FaUsers, FaPlus, FaTrash } from "react-icons/fa";
import { submitSessionReservation } from '@/app/lib/actions';
import { useRouter } from 'next/navigation';

export default function CreateSession() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [reservationType, setReservationType] = useState('individual');
  const [members, setMembers] = useState(['']);
  const [category, setCategory] = useState('');
  const [shiftName, setShiftName] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate) {
      const [year, month, day] = inputDate.split('-');
      setDate(`${month}-${day}-${year}`);
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

  const handleReservationTypeChange = (type) => {
    setReservationType(type);
    setMembers(['']); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formData = {
        category,
        arrivalDate: date,
        shiftName,
        fullName,
        members: reservationType === 'group' ? members.filter(m => m.trim()) : []
      };

      const result = await submitSessionReservation(formData);

      if (result.success) {
        router.push('/user/dashboard/reservation/success');
      } else {
        setError(result.error || 'Failed to submit reservation');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full min-h-screen mx-auto bg-white px-0 pb-20">
      {/* Hero Section */}
      <div className="relative mb-4 mt-0">
        <img 
          className="w-full h-[200px] object-cover" 
          src="https://via.placeholder.com/1402x272" 
          alt="Reservation banner"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#4d4d4d] to-black w-full mx-auto px-4 lg:px-8">
          <h1 className={`text-[#fcfcfc] text-5xl font-medium leading-[48px] p-8 font-manrope`}>
            RESERVE <br/>A SESSION
          </h1>
        </div>
      </div>

      {/* Reservation Type Selector */}
      <div className="flex justify-center gap-4 max-w-[1200px] mx-auto mb-4">
        <button
          type="button"
          onClick={() => handleReservationTypeChange('individual')}
          className={`flex items-center gap-2 px-3 py-1 rounded-2xl transition-all text-sm ${
            reservationType === 'individual' 
              ? 'bg-[#111010] text-white' 
              : 'bg-white text-[#666666] border border-[#666666]/30'
          }`}
        >
          <FaUser />
          Individual
        </button>
        <button
          type="button"
          onClick={() => handleReservationTypeChange('group')}
          className={`flex items-center gap-2 px-3 py-1 rounded-2xl transition-all text-sm ${
            reservationType === 'group' 
              ? 'bg-[#111010] text-white' 
              : 'bg-white text-[#666666] border border-[#666666]/30'
          }`}
        >
          <FaUsers />
          Group
        </button>
      </div>

      {/* Form Section */}
      <div className="flex justify-center flex-col gap-4 max-w-[1200px] mx-auto px-16 lg:px-20 overflow-x-auto">
        {/* Category Field */}
        <div className="space-y-1">
          <label htmlFor="category" className="text-[#666666] text-sm font-medium font-['Poppins']">
            Category
          </label>
          <select 
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] appearance-none"
          >
            <option value="" className="text-[#666666]/40">Choose your category</option>
            <option value="Reguler">Reguler</option>
            <option value="Student">Student</option>
          </select>
        </div>

        {/* Arrival Date Field */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Arrival Date
          </label>
          <div className="relative">
            <input 
              type="date"
              onChange={handleDateChange}
              className="absolute opacity-0 w-full h-full cursor-pointer"
            />
            <div className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 flex items-center">
              <span className={`text-sm font-normal font-['Poppins'] ${date ? 'text-[#666666]' : 'text-[#A9A9A9]'}`}>
                {date || 'Choose your arrival date'}
              </span>
              <IoCalendarOutline className="absolute right-6 top-1/2 -translate-y-1/2 text-[#666666] text-2xl" />
            </div>
          </div>
        </div>

        {/* Shift Field */}
        <div className="space-y-1">
          <label htmlFor="shiftName" className="text-[#666666] text-sm font-medium font-['Poppins']">
            Shift
          </label>
          <div className="relative">
            <select
              id="shiftName"
              name="shiftName"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] appearance-none"
            >
              <option value="" className="text-[#666666]/40">Choose your shift</option>
              <option value="Shift A">Shift A (10:00 - 14:00)</option>
              <option value="Shift B">Shift B (14:00 - 18:00)</option>
              <option value="Shift C">Shift C (18:00 - 22:00)</option>
            </select>
            <GoTriangleDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#666666] text-2xl pointer-events-none" />
          </div>
        </div>

        {/* Full Name Field */}
        <div className="space-y-1">
          <label htmlFor="fullName" className="text-[#666666] text-sm font-medium font-['Poppins']">
            Full Name
          </label>
          <input 
            id="fullName"
            name="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
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
                    className="h-[35px] flex-1 rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666] font-normal font-['Poppins']"
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

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={isSubmitting}
          className={`h-[40px] bg-[#111010] rounded-3xl text-white text-base font-semibold mt-4 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          } font-manrope`}
        >
          {isSubmitting ? 'Submit...' : 'Submit'}
        </button>
      </div>
    </form>
  );
} 