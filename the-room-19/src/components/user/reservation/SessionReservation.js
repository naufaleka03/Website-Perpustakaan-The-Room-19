"use client";
import { useState } from "react";
import { GoTriangleDown } from "react-icons/go";
import { IoCalendarOutline } from "react-icons/io5";
import { FaUser, FaUsers, FaPlus, FaTrash } from "react-icons/fa";
import { submitSessionReservation } from "@/app/lib/actions";
import { useRouter } from "next/navigation";
import PaymentSummaryModal from "@/components/payment/payment-summary";

export default function SessionReservation() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [reservationType, setReservationType] = useState("individual");
  const [members, setMembers] = useState([""]);
  const [category, setCategory] = useState("");
  const [shiftName, setShiftName] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [reservationFormData, setReservationFormData] = useState(null);

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
      if (!category || !date || !shiftName || !fullName) {
        throw new Error("Please fill in all required fields");
      }

      const formData = {
        category,
        arrival_date: date,
        shift_name: shiftName,
        full_name: fullName,
        members:
          reservationType === "group" ? members.filter((m) => m.trim()) : [],
      };

      // Check slot availability before proceeding to payment
      const response = await fetch("/api/sessions/check-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          arrival_date: date,
          shift_name: shiftName,
          reservation_type: reservationType,
          group_size:
            reservationType === "group"
              ? members.filter((m) => m.trim()).length + 1
              : 1, // +1 untuk pemesannya sendiri
        }),
      });

      const availabilityData = await response.json();

      if (!availabilityData.available) {
        throw new Error(
          availabilityData.message ||
            "Sorry, this shift is already fully booked. Please choose another shift or date."
        );
      }

      console.log("Form data before payment:", formData);

      // Store form data in localStorage
      localStorage.setItem("reservationFormData", JSON.stringify(formData));

      setShowPaymentModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // Debug logs to see what data we have
      console.log("Payment Result:", paymentResult);
      console.log("Reservation Data:", reservationFormData);
      console.log("Arrival Date:", reservationFormData.arrival_date);
      console.log("Date Type:", typeof reservationFormData.arrival_date);

      // Ensure we have a valid date
      if (!reservationFormData.arrival_date) {
        throw new Error("Missing arrival date in reservation data");
      }

      // Make sure date is properly formatted
      let formattedDate;
      try {
        formattedDate = new Date(reservationFormData.arrival_date)
          .toISOString()
          .split("T")[0];
      } catch (dateError) {
        console.error("Date formatting error:", dateError);
        throw new Error("Invalid arrival date format");
      }

      // Create formatted data for database insertion
      const sessionData = {
        category: reservationFormData.category,
        arrival_date: formattedDate,
        shift_name: reservationFormData.shift_name,
        full_name: reservationFormData.full_name,
        members: reservationFormData.members || [],
        payment_id: paymentResult.transaction_id,
        payment_status: paymentResult.transaction_status,
        payment_method: paymentResult.payment_type,
        amount: calculateAmount(),
        status: "not_attended",
      };

      // Log the final data being sent
      console.log("Session data being submitted:", sessionData);

      const result = await submitSessionReservation(sessionData);

      if (result.success) {
        router.push(
          `/payment-finish?order_id=${paymentResult.transaction_id}&transaction_status=${paymentResult.transaction_status}`
        );
      } else {
        throw new Error(result.error || "Failed to submit reservation");
      }
    } catch (err) {
      console.error("Reservation submission error:", err);
      setError(
        "Payment successful but failed to save reservation: " + err.message
      );
    }
    setShowPaymentModal(false);
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
          alt="Reservation banner"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#4d4d4d] to-black w-full mx-auto px-4 lg:px-8">
          <h1
            className={`text-[#fcfcfc] text-5xl font-medium leading-[48px] p-8 font-manrope`}
          >
            RESERVE <br />A SESSION
          </h1>
        </div>
      </div>

      {/* Reservation Type Selector */}
      <div className="flex justify-center gap-4 max-w-[1200px] mx-auto mb-4">
        <button
          type="button"
          onClick={() => handleReservationTypeChange("individual")}
          className={`flex items-center gap-2 px-3 py-1 rounded-2xl transition-all text-sm ${
            reservationType === "individual"
              ? "bg-[#111010] text-white"
              : "bg-white text-[#666666] border border-[#666666]/30"
          }`}
        >
          <FaUser />
          Individual
        </button>
        <button
          type="button"
          onClick={() => handleReservationTypeChange("group")}
          className={`flex items-center gap-2 px-3 py-1 rounded-2xl transition-all text-sm ${
            reservationType === "group"
              ? "bg-[#111010] text-white"
              : "bg-white text-[#666666] border border-[#666666]/30"
          }`}
        >
          <FaUsers />
          Group
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center mb-4">
        Select the reservation type that suits your needs. If you choose
        "Group," you can add members.
      </p>

      {/* Form Section */}
      <div className="flex justify-center flex-col gap-4 max-w-[1200px] mx-auto px-16 lg:px-20 overflow-x-auto">
        {/* Category Field */}
        <div className="space-y-1">
          <label
            htmlFor="category"
            className="text-[#666666] text-sm font-medium font-['Poppins']"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] appearance-none"
          >
            <option value="" className="text-[#666666]/40">
              Choose your category
            </option>
            <option value="Reguler">Reguler</option>
            <option value="Student">Student</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Select the category that matches your status.
          </p>
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
              <span
                className={`text-sm font-normal font-['Poppins'] ${
                  date ? "text-[#666666]" : "text-[#A9A9A9]"
                }`}
              >
                {date || "Choose your arrival date"}
              </span>
              <IoCalendarOutline className="absolute right-6 top-1/2 -translate-y-1/2 text-[#666666] text-2xl" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter the date of your visit to the library. Make sure to select the
            correct date.
          </p>
        </div>

        {/* Shift Field */}
        <div className="space-y-1">
          <label
            htmlFor="shiftName"
            className="text-[#666666] text-sm font-medium font-['Poppins']"
          >
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
              <option value="" className="text-[#666666]/40">
                Choose your shift
              </option>
              <option value="Shift A">Shift A (10:00 - 14:00)</option>
              <option value="Shift B">Shift B (14:00 - 18:00)</option>
              <option value="Shift C">Shift C (18:00 - 22:00)</option>
            </select>
            <GoTriangleDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#666666] text-2xl pointer-events-none" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Choose your visit time slot according to the available schedule.
          </p>
        </div>

        {/* Full Name Field */}
        <div className="space-y-1">
          <label
            htmlFor="fullName"
            className="text-[#666666] text-sm font-medium font-['Poppins']"
          >
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
          <p className="text-xs text-gray-500 mt-1">
            Enter your full name as stated on your official ID.
          </p>
        </div>

        {/* Group Members Section */}
        {reservationType === "group" && (
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
              <p className="text-xs text-gray-500 mt-1">
                Enter the names of group members if the reservation is for a
                group.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`h-[40px] bg-[#111010] rounded-3xl text-white text-sm font-semibold mt-2 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          } font-manrope`}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>

      {showPaymentModal && (
        <PaymentSummaryModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          reservationData={reservationFormData}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </form>
  );
}
