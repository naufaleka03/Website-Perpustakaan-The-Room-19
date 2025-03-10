'use client';

import { BiSearch } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import { useState } from 'react';

const HistoryPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("All book");

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false); // Tutup dropdown setelah memilih opsi
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
      <div className="w-full h-full relative bg-white">
        <div className="w-full mx-auto px-12 py-8">
          {/* Header */}
          <h1 className="text-black text-lg font-bold font-['Manrope'] mb-6">History</h1>

          {/* Main Content Container */}
          <div className="w-full bg-white rounded-2xl border border-[#cdcdcd] p-6">
            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full h-[40px] bg-neutral-50 rounded-2xl border border-[#cdcdcd] pl-10 text-[#666666]/50 text-xs font-normal font-['Manrope']"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="w-[383px] relative">
                <div 
                  className="w-full h-[40px] bg-neutral-50 rounded-2xl border border-[#cdcdcd] px-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="text-black text-xs font-normal font-['Poppins']">{selectedOption}</span>
                  <IoIosArrowDown className="text-gray-400" size={18} />
                </div>
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute w-full mt-2 bg-white rounded-xl border border-[#cdcdcd] shadow-lg overflow-hidden z-10">
                    <div className="py-2">
                    <button
                        className="w-full px-4 py-2 text-left text-xs font-normal hover:bg-[#eff0c3] hover:text-[#52570d]"
                        onClick={() => handleSelectOption("All Book")}
                      >
                        All Book
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-xs font-normal hover:bg-[#eff0c3] hover:text-[#52570d]"
                        onClick={() => handleSelectOption("Borrowed")}
                      >
                        Borrowed
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-xs font-normal hover:bg-[#eff0c3] hover:text-[#52570d]"
                        onClick={() => handleSelectOption("Returned")}
                      >
                        Returned
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* History Cards */}
            <div className="space-y-4">
              {/* History Card 1 */}
              <div className="w-full h-[161px] bg-white rounded-2xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] border border-[#cdcdcd] p-4 flex items-center">
                <div className="flex items-center h-full">
                  <img 
                    className="w-[84px] h-[120px] rounded-xl" 
                    src="https://placehold.co/84x120" 
                    alt="Book Cover" 
                  />
                </div>
                
                <div className="flex-1 ml-6">
                  <h3 className="text-black text-sm font-semibold font-['Manrope']">I Want To Die But I Want To Eat Tteokpokki</h3>
                  <div className="flex items-center mb-16">
                    <p className="text-[#666666] text-[11px] font-medium font-['Manrope']">1 other book</p>
                    <IoIosArrowDown className="text-[#666666] ml-1" size={10} />
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-right mb-6 pt-[15px]">
                    <p className="text-[#666666] text-xs font-semibold font-['Manrope']">Total Cost</p>
                    <p className="text-black text-sm font-semibold font-['Manrope']">Rp40.000</p>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button className="w-[138px] h-[34px] bg-white rounded-lg border border-[#2e3105] text-[#2e3105] text-xs font-medium">
                      Pay late fee
                    </button>
                    <button className="w-[138px] h-[34px] bg-[#2e3105] rounded-lg text-white text-xs font-medium">
                      Give a review
                    </button>
                  </div>
                </div>
              </div>

              {/* History Card 2 */}
              <div className="w-full h-[161px] bg-white rounded-2xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] border border-[#cdcdcd] p-4 flex items-center">
                <div className="flex items-center h-full">
                  <img 
                    className="w-[84px] h-[120px] rounded-xl" 
                    src="https://placehold.co/84x120" 
                    alt="Book Cover" 
                  />
                </div>
                
                <div className="flex-1 ml-6">
                  <h3 className="text-black text-sm font-semibold font-['Manrope']">Siapa Yang Memasak Makan Malam Adam Smith?</h3>
                  <div className="flex items-center mb-16"> </div>

                </div>

                <div className="flex flex-col items-end">
                  <div className="text-right mb-6 pt-[15px]">
                    <p className="text-[#666666] text-xs font-semibold font-['Manrope']">Total Cost</p>
                    <p className="text-black text-sm font-semibold font-['Manrope']">Rp10.000</p>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button className="w-[138px] h-[34px] bg-white rounded-lg border border-[#2e3105] text-[#2e3105] text-xs font-medium">
                      Extend
                    </button>
                    <button className="w-[138px] h-[34px] bg-[#2e3105] rounded-lg text-white text-xs font-medium">
                      Give a review
                    </button>
                  </div>
                </div>
              </div>

              {/* History Card 3 */}
              <div className="w-full h-[161px] bg-white rounded-2xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] border border-[#cdcdcd] p-4 flex items-center">
                <div className="flex items-center h-full">
                  <img 
                    className="w-[84px] h-[120px] rounded-xl" 
                    src="https://placehold.co/84x120" 
                    alt="Book Cover" 
                  />
                </div>
                
                <div className="flex-1 ml-6">
                  <h3 className="text-black text-sm font-semibold font-['Manrope']">Laut Bercerita</h3>
                  <div className="flex items-center mb-16"> </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-right mb-6 pt-[15px]">
                    <p className="text-[#666666] text-xs font-semibold font-['Manrope']">Total Cost</p>
                    <p className="text-black text-sm font-semibold font-['Manrope']">Rp10.000</p>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button className="w-[138px] h-[34px] bg-white rounded-lg border border-[#2e3105] text-[#2e3105] text-xs font-medium">
                      Extend
                    </button>
                    <button className="w-[138px] h-[34px] bg-[#2e3105] rounded-lg text-white text-xs font-medium">
                      Give a review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
