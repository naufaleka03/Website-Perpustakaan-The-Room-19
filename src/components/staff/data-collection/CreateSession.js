"use client";
import React, { useState, useEffect } from "react";
import { GoTriangleDown } from "react-icons/go";
import { IoCalendarOutline } from "react-icons/io5";
import { FaUser, FaUsers, FaPlus, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function CreateSession() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [reservationType, setReservationType] = useState("individual");
  const [members, setMembers] = useState([""]);
  const [category, setCategory] = useState("");
  const [shiftName, setShiftName] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for visual consistency
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate) {
      const [year, month, day] = inputDate.split("-");
      setDate(`${month}-${day}-${year}`);
    } else {
      setDate("");
    }
  };

  const addMember = () => {
    setMembers([...members, ""]);
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
    setMembers([""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = {
        category,
        arrivalDate: date,
        shiftName,
        fullName,
        members:
          reservationType === "group" ? members.filter((m) => m.trim()) : [],
      };

      const result = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const response = await result.json();

      if (response.success) {
        router.push("/user/dashboard/reservation/success");
      } else {
        setError(response.error || "Failed to submit reservation");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {/* Skeleton for group members section */}
            <div className="mb-6">
              <div className="h-4 w-1/4 bg-gray-200 animate-pulse rounded mb-2"></div>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center mb-2">
                  <div className="h-10 flex-1 bg-gray-100 animate-pulse rounded"></div>
                  <div className="h-10 w-10 bg-gray-100 animate-pulse rounded-2xl"></div>
                </div>
              ))}
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
    <form
      onSubmit={handleSubmit}
      className="w-full min-h-screen mx-auto bg-gradient-to-br from-[#232310] to-[#5f5f2c] px-0 pb-20"
    >
      {/* Hero Section */}
      <div className="relative mb-8 mt-0">
        <div className="w-full h-[360px] relative">
          <img src="/navigation/session.jpg" alt="Session Reservation Hero" className="w-full h-full object-cover rounded-none" />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#232310] pointer-events-none"></div>
          <div className="absolute inset-x-0 top-0 flex items-start w-full mx-auto px-4 lg:px-8 pt-16">
            <div className="max-w-[1200px] mx-auto w-full">
              <h1 className="text-[#fcfcfc] text-4xl font-medium leading-[44px] font-manrope">
                RESERVE A SESSION
              </h1>
              <p className="text-[#fcfcfc]/80 max-w-xl font-manrope">
                Book a session for visitors or staff at The Room 19 Library.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="relative z-10 max-w-[1000px] mx-auto px-6 lg:px-8 mb-12" style={{ marginTop: '-180px' }}>
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold text-[#111010] mb-2 font-manrope">Session Reservation Form</h2>
          <p className="text-[#666666] mb-6 text-sm">
            Please fill out the form below to reserve your session at The Room 19 Library. Choose your preferred time slot and category.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reservation Type Selector */}
            <div className="mb-6">
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => handleReservationTypeChange("individual")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-2xl transition-all text-sm font-manrope border ${
                    reservationType === "individual"
                      ? "bg-[#2e3105] text-white border-[#2e3105]"
                      : "bg-white text-[#2e3105] border-[#2e3105] hover:bg-[#f3f4e0]"
                  }`}
                >
                  <FaUser />
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => handleReservationTypeChange("group")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-2xl transition-all text-sm font-manrope border ${
                    reservationType === "group"
                      ? "bg-[#2e3105] text-white border-[#2e3105]"
                      : "bg-white text-[#2e3105] border-[#2e3105] hover:bg-[#f3f4e0]"
                  }`}
                >
                  <FaUsers />
                  Group
                </button>
              </div>
              <p className="text-xs text-[#666666]/80 text-center mt-2">
                Select the reservation type that suits your needs. If you choose "Group," you can add members.
              </p>
            </div>
            {/* Session Details */}
            <div className="mb-6">
              <div>
                {/* Category Field */}
                <div className="mb-4">
                  <label htmlFor="category" className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">Category</label>
                  <select id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="h-[40px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] appearance-none">
                    <option value="" className="text-[#666666]/40">Choose your category</option>
                    <option value="Reguler">Reguler</option>
                    <option value="Student">Student</option>
                  </select>
                  <p className="text-xs text-[#666666]/80 mt-1">Select the category that matches your status.</p>
                </div>
                {/* Arrival Date Field */}
                <div className="mb-4">
                  <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">Arrival Date</label>
                  <div className="relative">
                    <input type="date" onChange={handleDateChange} className="absolute opacity-0 w-full h-full cursor-pointer" />
                    <div className="h-[40px] w-full rounded-lg border border-[#666666]/30 px-4 flex items-center">
                      <span className={`text-sm font-normal font-['Poppins'] ${date ? "text-[#666666]" : "text-[#A9A9A9]"}`}>{date || "Choose your arrival date"}</span>
                      <IoCalendarOutline className="absolute right-6 top-1/2 -translate-y-1/2 text-[#666666] text-2xl" />
                    </div>
                  </div>
                  <p className="text-xs text-[#666666]/80 mt-1">Enter the date of your visit to the library. Make sure to select the correct date.</p>
                </div>
                {/* Shift Field */}
                <div className="mb-4">
                  <label htmlFor="shiftName" className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">Shift</label>
                  <div className="relative">
                    <select id="shiftName" name="shiftName" value={shiftName} onChange={(e) => setShiftName(e.target.value)} className="h-[40px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] appearance-none">
                      <option value="" className="text-[#666666]/40">Choose your shift</option>
                      <option value="Shift A">Shift A (10:00 - 14:00)</option>
                      <option value="Shift B">Shift B (14:00 - 18:00)</option>
                      <option value="Shift C">Shift C (18:00 - 22:00)</option>
                    </select>
                    <GoTriangleDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#666666] text-2xl pointer-events-none" />
                  </div>
                  <p className="text-xs text-[#666666]/80 mt-1">Choose your visit time slot according to the available schedule.</p>
                </div>
                {/* Full Name Field */}
                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">Full Name</label>
                  <input id="fullName" name="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-[40px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]" placeholder="Enter your full name" />
                  <p className="text-xs text-[#666666]/80 mt-1">Enter your full name as stated on your official ID.</p>
                </div>
              </div>
            </div>
            {/* Group Members Section */}
            {reservationType === "group" && (
              <div className="mb-6">
                <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">Group Members</label>
                <div className="space-y-3">
                  {members.map((member, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input type="text" value={member} onChange={(e) => handleMemberChange(index, e.target.value)} className="h-[40px] flex-1 rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666] font-normal font-['Poppins']" placeholder={`Member ${index + 1} name`} />
                      {index > 0 && (
                        <button type="button" onClick={() => removeMember(index)} className="h-[40px] w-[40px] flex items-center justify-center rounded-2xl border border-[#666666]/30 text-[#666666]">
                          <FaTrash size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addMember} className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-[#666666]/30 text-[#666666] mt-2">
                    <FaPlus size={12} />
                    <span>Add Member</span>
                  </button>
                  <p className="text-xs text-[#666666]/80 mt-1">Enter the names of group members if the reservation is for a group.</p>
                </div>
              </div>
            )}
            {error && (
              <div className="text-red-500 text-sm text-center mb-4">{error}</div>
            )}
            <button type="submit" disabled={isSubmitting} className={`h-[45px] w-full bg-[#2e3105] text-white rounded-3xl text-base font-semibold font-manrope flex items-center justify-center gap-2 transition mt-6 ${isSubmitting ? 'opacity-75' : 'hover:bg-[#404615]'}`}>{isSubmitting ? "Submitting..." : "Submit Reservation"}</button>
          </form>
        </div>
      </div>
    </form>
  );
}
