"use client"
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IoCalendarOutline } from "react-icons/io5";
import { submitEventUpdate } from '@/app/lib/actions';

export default function UpdateEvent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');
  
  const [event_name, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [event_date, setEventDate] = useState('');
  const [shift_name, setShiftName] = useState('');
  const [max_participants, setMaxParticipants] = useState('');
  const [ticket_fee, setTicketFee] = useState('');
  const [additional_notes, setAdditionalNotes] = useState('');
  const [activity_poster, setActivityPoster] = useState(null);
  const [currentPosterUrl, setCurrentPosterUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch event data');
        
        const data = await response.json();
        setEventName(data.event_name);
        setDescription(data.description);
        setEventDate(formatDate(data.event_date));
        setShiftName(data.shift_name);
        setMaxParticipants(data.max_participants.toString());
        setTicketFee(data.ticket_fee.toString());
        setAdditionalNotes(data.additional_notes);
        setCurrentPosterUrl(data.activity_poster);
      } catch (err) {
        setError('Failed to fetch event data');
        console.error('Error:', err);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setHours(12); 
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate) {
      const [year, month, day] = inputDate.split('-');
      const date = new Date(year, parseInt(month) - 1, parseInt(day));
      date.setHours(12); 
      
      const adjustedMonth = String(date.getMonth() + 1).padStart(2, '0');
      const adjustedDay = String(date.getDate()).padStart(2, '0');
      setEventDate(`${adjustedMonth}-${adjustedDay}-${date.getFullYear()}`);
    } else {
      setEventDate('');
    }
  };

  const handlePosterUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

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
        activity_poster: activity_poster ? URL.createObjectURL(activity_poster) : currentPosterUrl
      };

      const result = await submitEventUpdate(eventId, formData);

      if (result.success) {
        router.push('/staff/dashboard/reservation/event-list');
        router.refresh();
      } else {
        setError(result.error || 'Failed to update event');
      }
    } catch (err) {
      console.error('Error updating event:', err);
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
          alt="Update Event banner"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#4d4d4d] to-black w-full mx-auto px-4 lg:px-8">
          <h1 className="text-[#fcfcfc] text-5xl font-medium leading-[48px] p-8 font-manrope">
            UPDATE <br/>EVENT
          </h1>
        </div>
      </div>

      {/* Form Section - menggunakan struktur yang sama dengan CreateEvent.js */}
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

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Max Participants
          </label>
          <input
            type="number"
            value={max_participants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Ticket Fee
          </label>
          <input
            type="text"
            value={ticket_fee}
            onChange={(e) => setTicketFee(e.target.value)}
            className="h-[35px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Additional Notes
          </label>
          <textarea
            value={additional_notes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full rounded-lg border border-[#666666]/30 px-4 py-2 text-sm font-normal font-['Poppins'] text-[#666666] min-h-[100px]"
          />
        </div>

        {currentPosterUrl && (
          <div className="space-y-1">
            <label className="text-[#666666] text-sm font-medium font-['Poppins']">
              Current Poster
            </label>
            <img 
              src={currentPosterUrl} 
              alt="Current event poster" 
              className="w-full max-w-[200px] h-auto rounded-lg"
            />
          </div>
        )}

        {/* Upload New Poster */}
        <div className="space-y-1">
          <label className="text-[#666666] text-sm font-medium font-['Poppins']">
            Upload New Poster
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
                {activity_poster ? activity_poster.name : 'Choose new poster or drop here'}
              </span>
            </div>
          </div>
        </div>

        {/* Update Button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="h-[40px] bg-[#111010] rounded-3xl text-white text-base font-semibold mt-[20px] font-manrope"
        >
          {isSubmitting ? 'UPDATING...' : 'UPDATE EVENT'}
        </button>

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    </form>
  );
} 