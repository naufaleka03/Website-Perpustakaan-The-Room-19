"use client"
import { Manrope } from 'next/font/google';
import { FaWhatsapp, FaEnvelope, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export default function ListEvent() {
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
    <div className="max-w-[1440px] min-h-[850px] mx-auto bg-white px-0 pb-20">
      {/* Hero Section */}
      <div className="relative mb-4 mt-0">
        <img 
          className="w-full h-[200px] object-cover" 
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570"
          alt="Events banner"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#4d4d4d] to-black w-full">
          <h1 className={`text-[#fcfcfc] text-5xl font-medium leading-[48px] p-8 ${manrope.className}`}>
            EVENTS
          </h1>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-3 gap-6 max-w-[1200px] mx-10 px-6 mb-12">
        {events.map((event) => (
          <div 
            key={event.id} 
            className="bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02] max-w-[350px]"
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
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="max-w-[1200px] mx-10 grid grid-cols-2 gap-8 px-1">
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
                  currentSlide === index ? 'bg-white' : 'bg-white/50'
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
              Let's collaborate! We welcome external partners to create impactful events and meaningful programs. Please fill out the form accordingly. For any questions, feel free to contact us through the available channels.
            </p>
            <div className="flex gap-2 mt-12">
              <button className="px-6 py-2 bg-[#111010] text-white rounded-xl text-xs font-['Poppins'] w-[100px]">
                Form
              </button>
              <button className="p-2 bg-[#ffffff] text-black border border-black rounded-xl text-xs font-['Poppins'] flex items-center justify-center w-[40px] h-[36px]">
                <FaWhatsapp size={14} />
              </button>
              <button className="p-2 bg-[#ffffff] text-black border border-black rounded-xl text-xs font-['Poppins'] flex items-center justify-center w-[40px] h-[36px]">
                <FaEnvelope size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
