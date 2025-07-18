"use client";

import { BiSearch } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import { useState, useEffect } from "react";
import { createClient } from '@/app/supabase/client';
import { useRouter } from "next/navigation";
import DetailBorrowingModal from "./detail-borrowing-modal";

const getBorrowingStatus = (returnDate, status) => {
  if (status === 'Returned') return 'Returned';
  // Gunakan waktu WIB
  const now = new Date();
  const wibOffset = 7 * 60; // menit
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibNow = new Date(utc + (wibOffset * 60000));
  let returnDateObj = null;
  if (typeof returnDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(returnDate)) {
    returnDateObj = new Date(returnDate + 'T00:00:00+07:00');
  } else {
    returnDateObj = new Date(returnDate);
  }
  if (wibNow.setHours(0,0,0,0) > returnDateObj.setHours(0,0,0,0)) return 'Over Due';
  return 'On Going';
};

const History = () => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("All Book");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        if (!user.id) {
          console.error('User ID is undefined');
          setError('User authentication error');
          return;
        }

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

  // Cek jika ada query param refresh=1, maka fetch ulang data setelah mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('refresh') === '1') {
        // Paksa fetch ulang data
        setLoading(true);
        setTimeout(() => {
          window.location.replace(window.location.pathname); // Hapus query param agar tidak loop
        }, 100); // Sedikit delay agar fetchLoans jalan
      }
    }
  }, []);

  // Panggil PATCH /api/loans setiap kali halaman diakses/refresh
  useEffect(() => {
    fetch('/api/loans', { method: 'PATCH' });
  }, []);

  // Tambahkan polling untuk refetch data saat halaman history terbuka
  useEffect(() => {
    const interval = setInterval(async () => {
      // Refetch data setiap 2 detik (lebih cepat dari sebelumnya)
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.id) {
          return; // Skip jika user tidak login atau user.id undefined
        }

        const response = await fetch(`/api/loans?user_id=${user.id}`);
        const data = await response.json();

        if (response.ok) {
          setLoans(data.loans);
        }
      } catch (err) {
        console.error('Error fetching loans:', err);
      }
    }, 2000); // Reduced from 3000ms to 2000ms
    
    // Listen untuk custom event loanUpdated
    const loanUpdatedHandler = (event) => {
      console.log('loanUpdated event received in history:', event.detail);
      // Immediately refetch data when loan is updated
      const fetchLoans = async () => {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();

          if (!user || !user.id) {
            return;
          }

          const response = await fetch(`/api/loans?user_id=${user.id}`);
          const data = await response.json();

          if (response.ok) {
            console.log('History data updated after loan update');
            setLoans(data.loans);
          }
        } catch (err) {
          console.error('Error fetching loans after update:', err);
        }
      };
      fetchLoans();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('loanUpdated', loanUpdatedHandler);
    }
    
    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('loanUpdated', loanUpdatedHandler);
      }
    };
  }, [router]);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  const handleCardClick = (loan) => {
    setSelectedLoan(loan);
    setIsModalOpen(true);
  };

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      searchQuery.toLowerCase() === "" ||
      loan.book_title1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loan.book_title2 && loan.book_title2.toLowerCase().includes(searchQuery.toLowerCase()));

    const currentStatus = getBorrowingStatus(loan.loan_due || loan.return_date, loan.status);
    const matchesStatus =
      selectedOption === "All Book" ||
      (selectedOption === "On Going" && currentStatus === "On Going") ||
      (selectedOption === "Over Due" && currentStatus === "Over Due") ||
      (selectedOption === "Returned" && currentStatus === "Returned");

    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "Returned":
        return "bg-green-100 text-green-800";
      case "On Going":
        return "bg-yellow-100 text-yellow-800";
      case "Due Date":
        return "bg-yellow-100 text-yellow-800";
      case "Over Due":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
          <h1 className="text-black text-lg font-bold font-manrope mb-6">History</h1>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[40px] bg-neutral-50 rounded-2xl border border-[#cdcdcd] pl-10 text-[#666666] text-xs font-normal font-manrope"
              />
            </div>

            <div className="w-[383px] relative">
              <div
                className="w-full h-[40px] bg-neutral-50 rounded-2xl border border-[#cdcdcd] px-4 flex items-center justify-between cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-black text-xs font-normal font-manrope">{selectedOption}</span>
                <IoIosArrowDown className="text-gray-400" size={18} />
              </div>
              {isDropdownOpen && (
                <div className="absolute w-full mt-2 bg-white rounded-xl border border-[#cdcdcd] shadow-lg overflow-hidden z-10">
                  <div className="py-2">
                    {["All Book", "On Going", "Over Due", "Returned"].map((opt) => (
                      <button
                        key={opt}
                        className="w-full px-4 py-2 text-left text-xs text-[#666666] font-normal hover:bg-[#eff0c3] hover:text-[#52570d]"
                        onClick={() => handleSelectOption(opt)}
                      >
                        {opt === "On Going" ? "On Going" : opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {filteredLoans.length === 0 ? (
              <div className="w-full text-center py-12 text-[#666666] text-sm font-manrope">
                No borrowing history available.
              </div>
            ) : (
              filteredLoans.map((loan) => (
                <div
                  key={loan.id}
                  onClick={() => handleCardClick(loan)}
                  className="w-full h-[161px] bg-white rounded-2xl shadow-md border border-[#cdcdcd] p-4 flex items-center cursor-pointer hover:bg-neutral-50 transition"
                >
                  <div className="flex items-center h-full">
                    {loan.cover_image1 ? (
                      <img
                        className="w-[84px] h-[120px] rounded-xl object-cover"
                        src={loan.cover_image1}
                        alt={`${loan.book_title1} Cover`}
                      />
                    ) : (
                      <div className="w-[84px] h-[120px] rounded-xl bg-[#eff0c3] flex items-center justify-center">
                        <span className="text-[#52570d] font-bold text-xl font-manrope">
                          {loan.book_title1
                            .split(" ")
                            .slice(0, 2)
                            .map((word) => word[0].toUpperCase())
                            .join("")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 ml-6">
                    <h3 className="text-black text-sm font-semibold font-manrope">
                      {loan.book_title1}
                    </h3>

                    {loan.book_title2 && (
                      <div className="flex items-center mb-2">
                        <p className="text-[#666666] text-[11px] font-medium font-manrope">
                          1 other book
                        </p>
                        <IoIosArrowDown className="text-[#666666] ml-1" size={10} />
                      </div>
                    )}

                    <div className={`inline-block px-3 py-1 text-[10px] font-semibold rounded-xl mt-1 ${getStatusStyle(loan.status)}`}>
                      {loan.status}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="text-right mb-6 pt-[15px]">
                      <p className="text-[#666666] text-xs font-semibold font-manrope">Total Cost</p>
                      <p className="text-black text-sm font-semibold font-manrope">
                        Rp{typeof loan.total_price === 'number' ? loan.total_price.toLocaleString('id-ID') : (parseInt(loan.total_price)?.toLocaleString('id-ID') || loan.total_price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <DetailBorrowingModal
        isOpen={isModalOpen}
        borrowingData={selectedLoan ? {
          id: selectedLoan.id,
          borrowing_date: selectedLoan.loan_start,
          loan_due: selectedLoan.loan_due,
          status: selectedLoan.status,
          price: selectedLoan.total_price,
          extend_count: selectedLoan.extend_count,
          fine: selectedLoan.fine,
          fine_amount: selectedLoan.fine_amount,
          max_due: selectedLoan.max_due,
          copies: selectedLoan.copies,
          books: [
            {
              title: selectedLoan.book_title1,
              cover: selectedLoan.cover_image1
            },
            selectedLoan.book_title2 ? {
              title: selectedLoan.book_title2,
              cover: selectedLoan.cover_image2
            } : null
          ].filter(Boolean),
        } : null}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLoan(null);
        }}
      />
    </div>
  );
};

export default History;
