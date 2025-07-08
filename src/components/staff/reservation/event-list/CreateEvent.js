"use client";
import React, { useState, useEffect } from "react";
import { GoTriangleDown } from "react-icons/go";
import { IoCalendarOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/supabase/client";

export default function CreateEvent() {
  const router = useRouter();
  const supabase = createClient();
  const [event_name, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [event_date, setEventDate] = useState("");
  const [shift_name, setShiftName] = useState("");
  const [max_participants, setMaxParticipants] = useState("");
  const [ticket_fee, setTicketFee] = useState("");
  const [additional_notes, setAdditionalNotes] = useState("");
  const [event_poster, setEventPoster] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate) {
      const [year, month, day] = inputDate.split("-");
      const date = new Date(year, parseInt(month) - 1, parseInt(day));
      date.setHours(12); // Set jam ke tengah hari untuk menghindari masalah timezone

      const adjustedMonth = String(date.getMonth() + 1).padStart(2, "0");
      const adjustedDay = String(date.getDate()).padStart(2, "0");
      setEventDate(`${adjustedMonth}-${adjustedDay}-${date.getFullYear()}`);
    } else {
      setEventDate("");
    }
  };

  const handlePosterUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (maksimal 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should not exceed 5MB");
        return;
      }

      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      // Set gambar yang diupload untuk ditampilkan
      setEventPoster(file);
    }
  };

  const uploadEventPoster = async (file) => {
    if (!file) return null;

    try {
      // Create a unique file name to prevent collisions
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      console.log("Attempting to upload to:", "event-posters/" + filePath);
      console.log("File type:", file.type, "File size:", file.size);

      // Upload the image to Supabase Storage
      const { data, error } = await supabase.storage
        .from("event-posters")
        .upload(filePath, file);

      if (error) {
        console.error("Error uploading event poster:", error);
        throw error;
      }

      console.log("Upload successful:", data);

      // Get the public URL using Supabase's method
      const { data: urlData } = supabase.storage
        .from("event-posters")
        .getPublicUrl(filePath);

      console.log("Generated public URL:", urlData.publicUrl);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error in uploadEventPoster:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Upload event poster if one is selected
      let posterUrl = null;
      if (event_poster) {
        try {
          console.log(
            "Uploading event poster:",
            event_poster.name,
            "size:",
            event_poster.size
          );
          posterUrl = await uploadEventPoster(event_poster);
          console.log("Successfully uploaded poster, URL:", posterUrl);
        } catch (uploadError) {
          console.error("Error uploading poster:", uploadError);
          setError(
            "Failed to upload poster. Please try again with a different image."
          );
          setIsSubmitting(false);
          return;
        }
      }

      const formData = {
        event_name,
        description,
        event_date,
        shift_name,
        max_participants: parseInt(max_participants),
        ticket_fee: parseInt(ticket_fee.replace(/[^0-9]/g, "")),
        additional_notes,
        event_poster: posterUrl,
      };

      console.log("Submitting event data:", formData);
      const result = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const response = await result.json();

      if (response.success) {
        router.push("/staff/dashboard/reservation/event-list");
        router.refresh();
      } else {
        setError(response.error || "Failed to create event");
      }
    } catch (err) {
      console.error("Error submitting event:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen mx-auto bg-gradient-to-br from-[#232310] to-[#5f5f2c] px-0 pb-8">
      {/* Hero Section */}
      <div className="relative mb-8 mt-0">
        <img
          className="w-full h-[200px] object-cover"
          src="https://via.placeholder.com/1402x272"
          // alt="Reservation banner"
        />
        <div className="absolute inset-0 flex items-center bg-gradient-to-l from-[#4d4d4d]/80 to-black/90 w-full mx-auto px-4 lg:px-8">
          <div className="max-w-[1200px] mx-auto w-full">
            <h1 className="text-[#fcfcfc] text-5xl font-medium leading-[48px] font-manrope mb-2">
              CREATE <br />
              EVENT
            </h1>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-[1000px] mx-auto px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Event Name */}
            <div className="space-y-1">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Event Name
              </label>
              <input
                type="text"
                value={event_name}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter Event Name"
                className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the official name of the event.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter Description"
                className="w-full rounded-lg border border-[#666666]/30 px-4 py-2 text-sm font-normal font-['Poppins'] text-[#666666] min-h-[100px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a brief description of the event.
              </p>
            </div>

            {/* Event Date */}
            <div className="space-y-1">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Event Date
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
                      event_date ? "text-[#666666]" : "text-[#A9A9A9]"
                    }`}
                  >
                    {event_date || "Choose event date"}
                  </span>
                  <IoCalendarOutline className="absolute right-6 top-1/2 -translate-y-1/2 text-[#666666] text-2xl" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select the date when the event will take place.
              </p>
            </div>

            {/* Shift */}
            <div className="space-y-1">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Shift
              </label>
              <select
                value={shift_name}
                onChange={(e) => setShiftName(e.target.value)}
                className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
              >
                <option value="">Select Shift</option>
                <option value="Shift A">Shift A</option>
                <option value="Shift B">Shift B</option>
                <option value="Shift C">Shift C</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose the time slot for the event.
              </p>
            </div>

            {/* Max Participants */}
            <div className="space-y-1">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Max Participants
              </label>
              <input
                type="number"
                value={max_participants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                placeholder="Enter Max Participants"
                className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the maximum number of participants allowed.
              </p>
            </div>

            {/* Ticket Fee */}
            <div className="space-y-1">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Ticket Fee
              </label>
              <input
                type="text"
                value={ticket_fee}
                onChange={(e) => setTicketFee(e.target.value)}
                placeholder="Enter Ticket Fee"
                className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the ticket price for the event (in IDR).
              </p>
            </div>

            {/* Additional Notes */}
            <div className="space-y-1">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Additional Notes
              </label>
              <textarea
                value={additional_notes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Add Additional Notes"
                className="w-full rounded-lg border border-[#666666]/30 px-4 py-2 text-sm font-normal font-['Poppins'] text-[#666666] min-h-[100px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add any extra information for the event.
              </p>
            </div>

            {/* Upload Event Poster */}
            <div className="space-y-1">
              <label className="text-[#666666] text-sm font-medium font-['Poppins']">
                Upload Event Poster
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handlePosterUpload}
                  className="absolute opacity-0 w-full h-full cursor-pointer"
                  accept="image/*"
                />
                <div className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 flex items-center">
                  <span
                    className={`text-sm font-normal font-['Poppins'] ${
                      event_poster ? "text-[#666666]" : "text-[#A9A9A9]"
                    }`}
                  >
                    {event_poster
                      ? event_poster.name
                      : "Choose file or drop here"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Upload an image to represent the event. Max size: 5MB.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`h-[40px] w-full rounded-3xl text-white text-base font-semibold mt-[20px] font-manrope transition-colors duration-200 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#2e3105] hover:bg-[#404615]"
              }`}
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
            </button>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
