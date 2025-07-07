import React from 'react';
import { GoTriangleDown } from 'react-icons/go';

const Header = () => {
  return (
    <header className="w-full h-[72px] bg-white border-b border-[#666666]/25 fixed top-0 left-0 z-50">
      <div className="max-w-[1512px] h-full mx-auto px-10 flex items-center">
        {/* Logo/Avatar */}
        <div className="w-10 h-10 bg-[#c4c4c4] rounded-full" />

        {/* Navigation */}
        <nav className="flex items-center gap-10 ml-10 mt-7 mb-5">
          <div className="text-[#111111] text-base font-medium">Home</div>
          <div className="text-[#666666]/80 text-base">Page</div>
          <div className="text-[#666666]/80 text-base">Page</div>
          <div className="text-[#666666]/80 text-base">Page</div>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Language Selector */}
          <div className="flex items-center gap-0.5 pl-2 cursor-pointer">
            <div className="text-[#333333] text-base">English (United States)</div>
            <GoTriangleDown className="text-[#333333] ml-1" size={20} />
          </div>

          {/* Auth Buttons */}
          <button className="px-6 h-10 rounded-lg border border-[#111111] text-[#111111]">
            Log in
          </button>
          <button className="px-6 h-10 rounded-lg bg-[#111111] text-white border border-[#111111]">
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

