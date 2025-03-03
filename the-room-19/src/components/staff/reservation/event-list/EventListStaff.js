"use client"
import { Manrope } from 'next/font/google';
import { FaWhatsapp, FaEnvelope, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaPlus, FaEllipsisV } from 'react-icons/fa';
import { FaPencil, FaTrash } from 'react-icons/fa6';


const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export default function EventListStaff() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const events = [
    {
      id: 1,
      title: "Puppet-Making Workshop",
      description: "Join us for a creative workshop where you'll learn bringing these creations to life",
      date: "November 25, 2024",
      price: "Rp 100.000",
      image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09"
    },
    {
      id: 2,
      title: "Detective Board Game Night",
      description: "For those of you who like mysteries and detective stuff, you must come!",
      date: "October 25, 2024",
      price: "Rp 50.000",
      image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09"
    },
    {
      id: 3,
      title: "Detective Board Game Night",
      description: "For those of you who like mysteries and detective stuff, you must come!",
      date: "October 25, 2024",
      price: "Rp 50.000",
      image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09"
    },
    {
        id: 4,
        title: "Detective Board Game Night",
        description: "For those of you who like mysteries and detective stuff, you must come!",
        date: "October 25, 2024",
        price: "Rp 50.000",
        image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09"
    }
  ];

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
      <div className="flex justify-center flex-col gap-4 max-w-[1200px] mx-auto px-16 lg:px-20 overflow-x-aut pt-10">
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
          <div className="grid grid-cols-3 gap-10 max-w-[1200px] mx-5 px-6 mb-12">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02] max-w-[350px] relative"
                onClick={() => router.push(`/user/dashboard/reservation/event-reservation`)}
              >
                <img 
                  src={event.image}
                  alt={event.title}
                  className="w-full h-[150px] object-cover"
                />
                <div className="p-4 space-y-2">
                  <h3 className="text-[#111010] text-sm font-medium font-['Poppins']">
                    {event.title}
                  </h3>
                  <p className="text-[#666666] text-xs font-['Poppins']">
                    {event.description}
                  </p>
                  <p className="text-[#666666] text-xs font-['Poppins']">
                    {event.date}
                  </p>
                  <p className="text-[#111010] text-xs font-medium font-['Poppins']">
                    {event.price}
                  </p>
                </div>
                <div className="absolute bottom-2 right-2 flex gap-2">
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
            ))}
          </div>


      </div>
    </div>
  );
}
