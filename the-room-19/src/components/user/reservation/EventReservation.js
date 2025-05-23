"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GoTriangleDown } from "react-icons/go";
import { IoCalendarOutline } from "react-icons/io5";
import { FaUser, FaUsers, FaPlus, FaTrash } from "react-icons/fa";
import { submitEventReservation } from "@/app/lib/actions";
import PaymentSummaryEventsModal from "@/components/payment/payment-summary-events";

export default function EventReservation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [eventDetails, setEventDetails] = useState(null);
  const [reservationType, setReservationType] = useState("individual");
  const [members, setMembers] = useState([""]);
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [reservationFormData, setReservationFormData] = useState(null);

  useEffect(() => {
    if (!eventId) {
      router.push("/user/dashboard/reservation");
      return;
    }

    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event details");
        }
        const data = await response.json();
        setEventDetails(data);
      } catch (error) {
        console.error("Error fetching event details:", error);
        router.push("/user/dashboard/reservation");
      }
    };

    fetchEventDetails();
  }, [eventId, router]);

  const handleReservationTypeChange = (type) => {
    setReservationType(type);
    setMembers([""]);
  };

  const addMember = () => {
    if (members.length < 4) {
      setMembers([...members, ""]);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!eventDetails || !fullName || !eventId) {
        throw new Error("Please fill in all required fields");
      }

      const validMembers =
        reservationType === "group" ? members.filter((m) => m.trim()) : [];
      const groupSize = validMembers.length + 1; // +1 untuk pemesannya sendiri

      // Check slot availability
      const availabilityResponse = await fetch(
        "/api/events/check-availability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_id: eventId,
            reservation_type: reservationType,
            group_size: groupSize,
          }),
        }
      );

      if (!availabilityResponse.ok) {
        const errorData = await availabilityResponse.json();
        throw new Error(errorData.error || "Failed to check availability");
      }

      const availabilityData = await availabilityResponse.json();
      if (!availabilityData.available) {
        throw new Error(
          availabilityData.message || "Sorry, this event is fully booked."
        );
      }

      // Prepare form data for payment
      const formData = {
        event_name: eventDetails.event_name,
        description: eventDetails.description,
        event_date: eventDetails.event_date,
        shift_name: eventDetails.shift_name,
        shift_start: eventDetails.shift_start,
        shift_end: eventDetails.shift_end,
        max_participants: eventDetails.max_participants,
        ticket_fee: eventDetails.ticket_fee,
        additional_notes: eventDetails.additional_notes,
        full_name: fullName,
        members: validMembers,
      };

      setReservationFormData(formData);
      setShowPaymentModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      const reservationData = {
        ...reservationFormData,
        payment_id: paymentResult.order_id,
        payment_status: paymentResult.transaction_status,
        payment_method: paymentResult.payment_type,
      };

      const result = await submitEventReservation(reservationData);

      if (result.success) {
        router.push(
          `/payment-finish?order_id=${paymentResult.order_id}&transaction_status=${paymentResult.transaction_status}`
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
    <div className="w-full min-h-screen mx-auto bg-white px-0 pb-20">
      {/* Hero Section */}
      <div className="relative mb-4 mt-0">
        <img
          className="w-full h-[200px] object-cover"
          src="https://via.placeholder.com/1402x272"
          alt="Reservation banner"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#4d4d4d] to-black w-full mx-auto px-4 lg:px-8">
          <h1 className="text-[#fcfcfc] text-5xl font-medium leading-[48px] p-8 font-manrope">
            RESERVE <br />
            AN EVENT
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
          <FaUser size={14} />
          <span>Individual</span>
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
          <FaUsers size={14} />
          <span>Group</span>
        </button>
      </div>

      {/* Form Section */}
      <div className="flex justify-center flex-col gap-4 max-w-[1200px] mx-auto px-16 lg:px-20 overflow-x-auto">
        {/* Auto Generated Fields */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Event Name
          </label>
          <input
            type="text"
            value={eventDetails?.event_name || ""}
            disabled
            className="h-[35px] w-full rounded-md border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Description
          </label>
          <textarea
            value={eventDetails?.description || ""}
            disabled
            className="w-full rounded-md border border-[#666666]/30 px-4 py-2 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100"
            rows="3"
          ></textarea>
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Event Date
          </label>
          <input
            type="text"
            value={formatDate(eventDetails?.event_date) || ""}
            disabled
            className="h-[35px] w-full rounded-md border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Shift
          </label>
          <input
            type="text"
            value={eventDetails?.shift_name || ""}
            disabled
            className="h-[35px] w-full rounded-md border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Ticket Fee
          </label>
          <input
            type="text"
            value={formatRupiah(eventDetails?.ticket_fee) || ""}
            disabled
            className="h-[35px] w-full rounded-md border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100"
          />
        </div>

        {/* Full Name Field */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
            placeholder="Enter your full name"
          />
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
              {members.length < 4 && (
                <button
                  type="button"
                  onClick={addMember}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-[#666666]/30 text-[#666666]"
                >
                  <FaPlus size={12} />
                  <span>Add Member</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {error && <div className="text-red-500 text-center">{error}</div>}
        <button
          className="h-[40px] bg-[#111010] rounded-3xl text-white text-base font-semibold mt-[20px] font-manrope"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "SUBMIT"}
        </button>
      </div>

      {showPaymentModal && (
        <PaymentSummaryEventsModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          eventData={reservationFormData}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
