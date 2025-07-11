'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function landingHeader() {
  return (
    <div className="w-full h-[72px] relative mx-auto">
      <div className="w-full h-full absolute bg-white border border-solid" />
      
      <div className="flex items-center gap-3 absolute left-6 top-1/2 -translate-y-1/2">
        <Image
          src="/the-room-19.jpg"
          width={42}
          height={39}
          className="hidden md:block rounded-full"
          alt="The Room 19 independent library logo"
        />
        
        <h1 className="text-lg font-bold font-manrope text-[#2e3105]">
          The Room 19
        </h1>
      </div>

      <div className="flex items-center gap-4 absolute right-6 top-1/2 -translate-y-1/2">
        <Link
          href="/login"
          className="px-4 py-2 text-sm font-semibold text-[#2e3105] hover:bg-gray-100 rounded-3xl transition-colors"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 text-sm font-semibold text-white bg-[#2e3105] rounded-3xl hover:bg-[#3e4310] transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}