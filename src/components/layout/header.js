'use client';

import { IoMenu, IoNotificationsOutline, IoMoonOutline} from 'react-icons/io5';
import Image from 'next/image';


export default function Header({ isExpanded, setIsExpanded }) {
  return (
    <div className="w-full h-[72px] relative mx-auto">
      <div className="w-full h-full absolute bg-white border border-solid" />
      
      <div className="flex items-center gap-3 absolute left-6 top-1/2 -translate-y-1/2">
        <button 
          className="mr-4"
          aria-label="Menu"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <IoMenu className="w-7 h-7 text-black" />
        </button>

        <Image
        src="/the-room-19.jpg"
        width={56}
        height={52}
        className="hidden md:block rounded-full"
        alt="The Room 19 independent library logo"
        />
        
        <h1 className="text-lg font-bold font-manrope text-[#2e3105]">
          The Room 19
        </h1>
      </div>

      <div className="flex items-center gap-6 absolute right-6 top-1/2 -translate-y-1/2">
        {/* <button aria-label="Notifications">
          <IoNotificationsOutline className="w-6 h-7 text-black" />
        </button>
        <button aria-label="Dark Mode">
          <IoMoonOutline className="w-6 h-6 text-black" />
        </button> */}
      </div>
    </div>
  );
}