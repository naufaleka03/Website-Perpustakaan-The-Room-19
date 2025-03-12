"use client"
import { FaWhatsapp, FaEnvelope, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaPlus, FaEllipsisV } from 'react-icons/fa';
import { FaPencil, FaTrash } from 'react-icons/fa6';
import { eventData } from './data/EventDataStaff';

export default function EventListStaff() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const events = eventData;
  const eventsPerPage = 12; // 3 kesamping x 4 kebawah

  const getPaginatedEvents = () => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    return events.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(events.length / eventsPerPage);

  const carouselImages = [
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655",
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  return (
    <div className="w-full min-h-screen mx-auto bg-white px-0 pb-20">
      <div className="flex justify-center flex-col gap-4 max-w-[1200px] mx-auto px-16 lg:px-20 overflow-x-auto pt-10">
        <div className="flex justify-start items-center mb-6 mx-11">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-[#2e3105] text-white rounded-lg text-sm hover:bg-[#2e3105] transition-colors"
            onClick={() => router.push('/staff/dashboard/resevation/event-list/create-event')}
          >
            <FaPlus size={14} />
            Create Event
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-3 gap-6 max-w-[1200px] mx-5 px-6 mb-1 min-h-[400px]">
          {events.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center space-y-4">
              <p className="text-[#666666] text-sm font-['Poppins']">
                No events available at the moment
              </p>
              <p className="text-[#666666] text-xs font-['Poppins'] text-center">
                Please create new event
              </p>
            </div>
          ) : (
            getPaginatedEvents().map((event) => (
              <div 
                key={event.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02] max-w-[350px] h-[300px] flex flex-col relative"
                onClick={() => router.push(`/user/dashboard/reservation/event-reservation`)}
              >
                <img 
                  src={event.image}
                  alt={event.title}
                  className="w-full h-[150px] object-cover"
                />
                <div className="p-4 space-y-2 flex-1 flex flex-col">
                  <h3 className="text-[#111010] text-sm font-medium font-['Poppins'] line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-[#666666] text-xs font-['Poppins'] line-clamp-2 flex-1">
                    {event.description}
                  </p>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[#666666] text-xs font-['Poppins']">
                      {event.date}
                    </p>
                    <p className="text-[#111010] text-xs font-medium font-['Poppins']">
                      {event.price}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-4 right-2 flex gap-2">
                  <button 
                    className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-200 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle edit
                    }}
                  >
                    <FaPencil size={14} className="text-[#666666]" />
                  </button>
                  <button 
                    className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle delete
                    }}
                  >
                    <FaTrash size={14} className="text-red-600 hover:text-white" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded text-xs ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-[#666666] border border-[#666666]/30 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <span className="text-xs text-[#666666]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded text-xs ${
              currentPage === totalPages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-[#666666] border border-[#666666]/30 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
