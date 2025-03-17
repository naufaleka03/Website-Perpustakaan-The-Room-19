"use client"
import { useState } from 'react';
import { GoTriangleDown } from 'react-icons/go';
import { IoCalendarOutline } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import { submitEventCreation } from '@/app/lib/actions';

export default function CreateEvent() {
  const router = useRouter();
  const [event_name, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [event_date, setEventDate] = useState('');
  const [shift_name, setShiftName] = useState('');
  const [max_participants, setMaxParticipants] = useState('');
  const [ticket_fee, setTicketFee] = useState('');
  const [additional_notes, setAdditionalNotes] = useState('');
  const [activity_poster, setActivityPoster] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate) {
      const [year, month, day] = inputDate.split('-');
      setEventDate(`${month}-${day}-${year}`);
    } else {
      setEventDate('');
    }
  };

  const handlePosterUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setActivityPoster(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formData = {
        event_name,
        description,
        event_date,
        shift_name,
        max_participants: parseInt(max_participants),
        ticket_fee: parseInt(ticket_fee.replace(/[^0-9]/g, '')),
        additional_notes,
        activity_poster: activity_poster ? URL.createObjectURL(activity_poster) : null
      };

      console.log('Submitting event data:', formData);
      const result = await submitEventCreation(formData);

      if (result.success) {
        router.push('/staff/dashboard/reservation/event-list');
        router.refresh();
      } else {
        setError(result.error || 'Failed to create event');
      }
    } catch (err) {
      console.error('Error submitting event:', err);
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
            CREATE <br/>EVENT
          </h1>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex justify-center flex-col gap-4 max-w-[1200px] mx-auto px-16 lg:px-20 overflow-x-auto">
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
              <span className={`text-sm font-normal font-['Poppins'] ${event_date ? 'text-[#666666]' : 'text-[#A9A9A9]'}`}>
                {event_date || 'Choose event date'}
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
        </div>

        {/* Upload Activity Poster */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Upload Activity Poster
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={handlePosterUpload}
              className="absolute opacity-0 w-full h-full cursor-pointer"
              accept="image/*"
            />
            <div className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 flex items-center">
              <span className={`text-sm font-normal font-['Poppins'] ${activity_poster ? 'text-[#666666]' : 'text-[#A9A9A9]'}`}>
                {activity_poster ? activity_poster.name : 'Choose file or drop here'}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="h-[40px] bg-[#111010] rounded-3xl text-white text-base font-semibold mt-[20px] font-manrope"
        >
          {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
        </button>

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    </form>
  );
} 