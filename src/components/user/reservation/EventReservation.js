"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GoTriangleDown } from "react-icons/go";
import { IoCalendarOutline } from "react-icons/io5";
import { FaUser, FaUsers, FaPlus, FaTrash } from "react-icons/fa";
import { createClient } from "@/app/supabase/client";
import PaymentSummaryEventsModal from "@/components/payment/payment-summary-events";
import Image from "next/image";

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
  const [userId, setUserId] = useState(null);
  const supabase = createClient();

  // Add carousel state
  const eventImages = [
    "/events/event(1).jpg",
    "/events/event(2).jpg",
    "/events/event(3).jpg",
  ];
  const [currentImage, setCurrentImage] = useState(0);
  const [imageError, setImageError] = useState(false);

  const handlePrevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? eventImages.length - 1 : prev - 1));
  };
  const handleNextImage = () => {
    setCurrentImage((prev) => (prev === eventImages.length - 1 ? 0 : prev + 1));
  };

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

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Ambil nama user dari tabel visitors
        const { data: visitorData, error } = await supabase
          .from("visitors")
          .select("name")
          .eq("id", user.id)
          .single();
        if (visitorData && visitorData.name) {
          setFullName(visitorData.name);
        }
      }
    };

    fetchEventDetails();
    fetchUser();
  }, [eventId, router, supabase]);

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
        user_id: userId,
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

      const result = await fetch("/api/eventreservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      });

      const response = await result.json();

      if (response.success) {
        router.push(
          `/payment-finish?order_id=${paymentResult.order_id}&transaction_status=${paymentResult.transaction_status}`
        );
      } else {
        throw new Error(response.error || "Failed to submit reservation");
      }
    } catch (err) {
      console.error("Reservation submission error:", err);
      setError(
        "Payment successful but failed to save reservation: " + err.message
      );
    }
    setShowPaymentModal(false);
  };

  if (!eventDetails) {
    return (
      <div className="w-full min-h-screen mx-auto bg-gradient-to-br from-[#232310] to-[#5f5f2c] px-0 pb-8">
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
    <div className="w-full min-h-screen mx-auto bg-gradient-to-br from-[#232310] to-[#5f5f2c] px-0 pb-8">
      {/* Hero Section */}
      <div className="relative mb-8 mt-0">
        <div className="w-full h-[360px] relative overflow-hidden">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-500">Image not found</span>
            </div>
          ) : (
            <Image
              src={eventImages[currentImage]}
              alt={`Event Carousel ${currentImage + 1}`}
              fill
              className="object-cover rounded-none transition-all duration-500"
              priority
              onError={() => {
                setImageError(true);
                console.warn('Image not found:', eventImages[currentImage]);
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#232310] pointer-events-none"></div>
          {/* Carousel Controls */}
          <button
            type="button"
            onClick={() => { setImageError(false); handlePrevImage(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-[#2e3105] rounded-full p-2 z-10"
            aria-label="Previous image"
          >
            &#8592;
          </button>
          <button
            type="button"
            onClick={() => { setImageError(false); handleNextImage(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-[#2e3105] rounded-full p-2 z-10"
            aria-label="Next image"
          >
            &#8594;
          </button>
          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {eventImages.map((_, idx) => (
              <span
                key={idx}
                className={`inline-block w-2 h-2 rounded-full ${idx === currentImage ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
          <div className="absolute inset-x-0 top-0 flex items-start w-full mx-auto px-4 lg:px-8 pt-16">
            <div className="max-w-[1200px] mx-auto w-full">
              <h1 className="text-[#fcfcfc] text-4xl font-medium leading-[44px] font-manrope">
                RESERVE AN EVENT
              </h1>
              <p className="text-[#fcfcfc]/80 max-w-xl font-manrope">
                Book your spot for special events at The Room 19 Library and join our vibrant community.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="relative z-10 max-w-[1000px] mx-auto px-6 lg:px-8 mb-12" style={{ marginTop: '-180px' }}>
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
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
                <FaUser size={14} />
                <span>Individual</span>
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
                <FaUsers size={14} />
                <span>Group</span>
              </button>
            </div>
            <p className="text-xs text-[#666666]/80 text-center mt-2">
              Select the reservation type that suits your needs. If you choose "Group," you can add members.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div className="mb-4">
              <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">Event Name</label>
              <input type="text" value={eventDetails?.event_name || ""} disabled className="h-[40px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100" />
              <p className="text-xs text-[#666666]/80 mt-1">This field will be automatically filled based on your selection.</p>
            </div>
            {/* Description */}
            <div className="mb-4">
              <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">Description</label>
              <textarea value={eventDetails?.description || ""} disabled className="w-full rounded-lg border border-[#666666]/30 px-4 py-2 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100" rows="3"></textarea>
              <p className="text-xs text-[#666666]/80 mt-1">This field will be automatically filled based on your selection.</p>
            </div>
            {/* Event Date */}
            <div className="mb-4">
              <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">Event Date</label>
              <input type="text" value={formatDate(eventDetails?.event_date) || ""} disabled className="h-[40px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100" />
              <p className="text-xs text-[#666666]/80 mt-1">The event date is set automatically according to the chosen schedule.</p>
            </div>
            {/* Shift */}
            <div className="mb-4">
              <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">Shift</label>
              <input type="text" value={eventDetails?.shift_name || ""} disabled className="h-[40px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100" />
              <p className="text-xs text-[#666666]/80 mt-1">Shift timing is set automatically according to the chosen schedule.</p>
            </div>
            {/* Ticket Fee */}
            <div className="mb-4">
              <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">Ticket Fee</label>
              <input type="text" value={formatRupiah(eventDetails?.ticket_fee) || ""} disabled className="h-[40px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666] bg-gray-100" />
              <p className="text-xs text-[#666666]/80 mt-1">Ticket price will be displayed automatically.</p>
            </div>
            {/* Full Name */}
            <div className="mb-4">
              <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-[40px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]" placeholder="Enter your full name" />
              <p className="text-xs text-[#666666]/80 mt-1">Enter your full name as stated on your official ID.</p>
            </div>
            {/* Group Members */}
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
                  {members.length < 4 && (
                    <button type="button" onClick={addMember} className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-[#666666]/30 text-[#666666] mt-2">
                      <FaPlus size={12} />
                      <span>Add Member</span>
                    </button>
                  )}
                  <p className="text-xs text-[#666666]/80 mt-1">Enter the names of group members if the reservation is for a group.</p>
                </div>
              </div>
            )}
            {/* Error Message */}
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}
            {/* Submit Button */}
            <button type="submit" className={`h-[45px] w-full bg-[#2e3105] text-white rounded-3xl text-base font-semibold font-manrope flex items-center justify-center gap-2 transition mt-6 ${isSubmitting ? 'opacity-75' : 'hover:bg-[#404615]'}`} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Reservation"}
            </button>
          </form>
        </div>
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
