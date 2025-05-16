"use client";
import {
  FaWhatsapp,
  FaEnvelope,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ListEvent() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState([]);
  const eventsPerPage = 6;

  const carouselImages = [
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655",
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === carouselImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  };

  const getPaginatedEvents = () => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    return events.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(events.length / eventsPerPage);

  const formatDate = (dateString) => {
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

  const truncateDescription = (description, maxLength) => {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + "...";
  };

  return (
    <div className="w-full min-h-screen mx-auto bg-white px-0 pb-20">
      <div className="flex justify-center flex-col gap-4 max-w-[1200px] mx-auto px-16 lg:px-20 overflow-x-aut pt-10">
        <div className="grid grid-cols-3 gap-6 max-w-[1200px] mx-5 px-6 mb-2 min-h-[400px]">
          {events.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center space-y-4">
              <p className="text-[#666666] text-sm font-['Poppins']">
                No events available at the moment
              </p>
              <p className="text-[#666666] text-xs font-['Poppins'] text-center">
                Please check back later or contact us for more information
              </p>
            </div>
          ) : (
            getPaginatedEvents().map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02] max-w-[350px] h-[300px] flex flex-col"
                onClick={() =>
                  router.push(
                    `/user/dashboard/reservation/event-list/event-reservation?eventId=${event.id}`
                  )
                }
              >
                <img
                  src={event.activity_poster}
                  alt={event.event_name}
                  className="w-full h-[150px] object-cover"
                />
                <div className="p-4 space-y-2 flex-1 flex flex-col">
                  <h3 className="text-[#111010] text-sm font-medium font-['Poppins'] line-clamp-1">
                    {event.event_name}
                  </h3>
                  <p className="text-[#666666] text-xs font-['Poppins'] line-clamp-2 flex-1">
                    {truncateDescription(event.description, 80)}
                  </p>
                  <div className="space-y-1">
                    <p className="text-[#666666] text-xs font-['Poppins']">
                      {formatDate(event.event_date)}
                    </p>
                    <p className="text-[#111010] text-xs font-medium font-['Poppins']">
                      {formatRupiah(event.ticket_fee)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center items-center gap-4 mt-1 mb-14">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded text-xs ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-[#666666] border border-[#666666]/30 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <span className="text-xs text-[#666666]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded text-xs ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-[#666666] border border-[#666666]/30 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>

        {/* Bottom Section */}
        <div className="max-w-[1200px] mx-2 grid grid-cols-2 gap-8 px-1">
          {/* Carousel Section */}
          <div className="relative h-[300px] rounded-2xl overflow-hidden shadow-md">
            <img
              src={carouselImages[currentSlide]}
              alt="Carousel"
              className="w-full h-full object-cover"
            />
            {/* Arrow Navigation */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
            >
              <FaChevronLeft className="text-[#111010] text-xl" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
            >
              <FaChevronRight className="text-[#111010] text-xl" />
            </button>
            {/* Dots Navigation */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    currentSlide === index ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>

          {/* Collaboration Program Card */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="space-y-3">
              <h2 className="text-[#111010] text-sm font-medium font-['Poppins']">
                Collaboration Program
              </h2>
              <p className="text-[#666666] text-xs font-['Poppins']">
                Let's collaborate! We welcome external partners to create
                impactful events and meaningful programs. Please fill out the
                form accordingly. For any questions, feel free to contact us
                through the available channels.
              </p>
              <div className="flex gap-2 mt-12">
                <button className="px-6 py-2 bg-[#111010] text-white rounded-2xl text-xs font-['Poppins'] w-[100px]">
                  Form
                </button>
                <button className="p-2 bg-[#ffffff] text-black border border-black rounded-2xl text-xs font-['Poppins'] flex items-center justify-center w-[40px] h-[36px]">
                  <FaWhatsapp size={14} />
                </button>
                <button className="p-2 bg-[#ffffff] text-black border border-black rounded-2xl text-xs font-['Poppins'] flex items-center justify-center w-[40px] h-[36px]">
                  <FaEnvelope size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
