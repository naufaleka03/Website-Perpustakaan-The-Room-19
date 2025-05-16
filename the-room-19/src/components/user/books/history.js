"use client";

import { BiSearch } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import { useState, useEffect } from "react";
import { createClient } from '@/app/supabase/client';
import { useRouter } from "next/navigation";

const History = () => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("All Book");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        // Fetch loans data for the logged in user
        const response = await fetch(`/api/loans?user_id=${user.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch loans');
        }

        setLoans(data.loans);
      } catch (err) {
        console.error('Error fetching loans:', err);
        setError('Failed to load loan history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [router]);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  // Filter loans based on search and status
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      loan.book_title1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loan.book_title2 && loan.book_title2.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedOption === "All Book" || 
      (selectedOption === "Borrowed" && loan.status === "On Going") ||
      (selectedOption === "Returned" && loan.status === "Returned");

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex-1 min-h-[calc(100vh-72px)] bg-white flex justify-center items-center">
        <p>Loading loan history...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
      <div className="w-full h-full relative bg-white">
        <div className="w-full mx-auto px-12 py-8">
          {/* Header */}
          <h1 className="text-black text-lg font-bold font-manrope mb-6">
            History
          </h1>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <BiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[40px] bg-neutral-50 rounded-2xl border border-[#cdcdcd] pl-10 text-[#666666]/50 text-xs font-normal font-manrope"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="w-[383px] relative">
              <div
                className="w-full h-[40px] bg-neutral-50 rounded-2xl border border-[#cdcdcd] px-4 flex items-center justify-between cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-black text-xs font-normal font-manrope">
                  {selectedOption}
                </span>
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
            {filteredLoans.map((loan) => (
              <div key={loan.id} className="w-full h-[161px] bg-white rounded-2xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] border border-[#cdcdcd] p-4 flex items-center">
                <div className="flex items-center h-full">
                  <img
                    className="w-[84px] h-[120px] rounded-xl"
                    src={loan.cover_image1 || "https://placehold.co/84x120"}
                    alt={`${loan.book_title1} Cover`}
                  />
                </div>

                <div className="flex-1 ml-6">
                  <h3 className="text-black text-sm font-semibold font-manrope">
                    {loan.book_title1}
                  </h3>
                  {loan.book_title2 && (
                    <div className="flex items-center mb-16">
                      <p className="text-[#666666] text-[11px] font-medium font-manrope">
                        1 other book
                      </p>
                      <IoIosArrowDown className="text-[#666666] ml-1" size={10} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-right mb-6 pt-[15px]">
                    <p className="text-[#666666] text-xs font-semibold font-manrope">
                      Total Cost
                    </p>
                    <p className="text-black text-sm font-semibold font-manrope">
                      Rp{loan.total_price?.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex gap-3 mt-6">
                    {loan.status === 'On Going' && (
                      <button className="w-[138px] h-[34px] bg-white rounded-lg border border-[#2e3105] text-[#2e3105] text-xs font-medium">
                        Extend
                      </button>
                    )}
                    {loan.status === 'Returned' && (
                      <button className="w-[138px] h-[34px] bg-[#2e3105] rounded-lg text-white text-xs font-medium">
                        Give a review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
