"use client";
import { useState, useEffect } from "react";
import { GoTriangleDown } from "react-icons/go";
import { IoCalendarOutline } from "react-icons/io5";
import { FaUser, FaUsers, FaPlus, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import PaymentSummaryModal from "@/components/payment/payment-summary";
import { createClient } from "@/app/supabase/client";

export default function SessionReservation() {
  const router = useRouter();
  const [user, setUser] = useState(null);
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
  const [shiftAvailability, setShiftAvailability] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Fetch visitor data
        const { data: visitorData, error } = await supabase
          .from("visitors")
          .select("*")
          .eq("id", user.id)
          .single();
        if (visitorData) {
          setUser(visitorData);
          setFullName(visitorData.name); // Pre-fill the full name
        } else if (error) {
          console.error("Error fetching visitor data:", error);
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate) {
      setDate(inputDate);
      fetchShiftAvailability(inputDate);
    } else {
      setDate("");
      setShiftAvailability({});
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

  const fetchShiftAvailability = async (selectedDate) => {
    const shifts = ["Shift A", "Shift B", "Shift C"];
    const results = {};
    for (const shift of shifts) {
      try {
        const response = await fetch("/api/sessions/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            arrival_date: selectedDate,
            shift_name: shift,
            reservation_type: reservationType,
            group_size:
              reservationType === "group"
                ? members.filter((m) => m.trim()).length + 1
                : 1,
          }),
        });
        const data = await response.json();
        results[shift] = data.available_slots ?? 0;
      } catch (err) {
        results[shift] = 0;
      }
    }
    setShiftAvailability(results);
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
        user_id: user ? user.id : null,
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
        user_id: reservationFormData.user_id,
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

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });

      const result = await response.json();

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
    <div className="w-full min-h-screen mx-auto bg-gradient-to-br from-[#232310] to-[#5f5f2c] px-0 pb-20">
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
                Book your study session at The Room 19 Library and enjoy our comfortable reading spaces.
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
            Please fill out the form below to reserve your study session at The Room 19 Library. Choose your preferred time slot and category.
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
                  <label
                    htmlFor="category"
                    className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-[40px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] appearance-none"
                  >
                    <option value="" className="text-[#666666]/40">
                      Choose your category
                    </option>
                    <option value="Reguler">Reguler</option>
                    <option value="Student">Student</option>
                  </select>
                  <p className="text-xs text-[#666666]/80 mt-1">
                    Select the category that matches your status.
                  </p>
                </div>

                {/* Arrival Date Field */}
                <div className="mb-4">
                  <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">
                    Arrival Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      onChange={handleDateChange}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="h-[40px] w-full rounded-lg border border-[#666666]/30 px-4 flex items-center">
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
                  <p className="text-xs text-[#666666]/80 mt-1">
                    Enter the date of your visit to the library. Make sure to
                    select the correct date.
                  </p>
                </div>

                {/* Shift Field */}
                <div className="mb-4">
                  <label
                    htmlFor="shiftName"
                    className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1"
                  >
                    Shift
                  </label>
                  <div className="relative">
                    <select
                      id="shiftName"
                      name="shiftName"
                      value={shiftName}
                      onChange={(e) => setShiftName(e.target.value)}
                      className="h-[40px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] appearance-none"
                    >
                      <option value="" className="text-[#666666]/40">
                        Choose your shift
                      </option>
                      <option value="Shift A">
                        Shift A (10:00 - 14:00)
                        {shiftAvailability["Shift A"] !== undefined
                          ? ` - ${shiftAvailability["Shift A"]} slots left`
                          : ""}
                      </option>
                      <option value="Shift B">
                        Shift B (14:00 - 18:00)
                        {shiftAvailability["Shift B"] !== undefined
                          ? ` - ${shiftAvailability["Shift B"]} slots left`
                          : ""}
                      </option>
                      <option value="Shift C">
                        Shift C (18:00 - 22:00)
                        {shiftAvailability["Shift C"] !== undefined
                          ? ` - ${shiftAvailability["Shift C"]} slots left`
                          : ""}
                      </option>
                    </select>
                    <GoTriangleDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#666666] text-2xl pointer-events-none" />
                  </div>
                  <p className="text-xs text-[#666666]/80 mt-1">
                    Choose your visit time slot according to the available
                    schedule.
                  </p>
                </div>

                {/* Full Name Field */}
                <div className="mb-4">
                  <label
                    htmlFor="fullName"
                    className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-[40px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
                    placeholder="Enter your full name"
                  />
                  <p className="text-xs text-[#666666]/80 mt-1">
                    Enter your full name as stated on your official ID.
                  </p>
                </div>
              </div>
            </div>

            {/* Group Members Section */}
            {reservationType === "group" && (
              <div className="mb-6">
                <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">
                  Group Members
                </label>
                <div className="space-y-3">
                  {members.map((member, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={member}
                        onChange={(e) =>
                          handleMemberChange(index, e.target.value)
                        }
                        className="h-[40px] flex-1 rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666] font-normal font-['Poppins']"
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
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-[#666666]/30 text-[#666666] mt-2"
                  >
                    <FaPlus size={12} />
                    <span>Add Member</span>
                  </button>
                  <p className="text-xs text-[#666666]/80 mt-1">
                    Enter the names of group members if the reservation is for a group.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm text-center mb-4">{error}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`h-[45px] w-full bg-[#2e3105] text-white rounded-3xl text-base font-semibold font-manrope flex items-center justify-center gap-2 transition mt-6 ${
                isSubmitting ? 'opacity-75' : 'hover:bg-[#404615]'
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Reservation"}
            </button>
          </form>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentSummaryModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          reservationData={reservationFormData}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
