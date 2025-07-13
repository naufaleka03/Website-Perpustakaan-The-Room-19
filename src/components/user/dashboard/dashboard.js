"use client";
import React, { useState, useEffect } from 'react';
import { FaFire, FaStar, FaUser, FaRegCalendarAlt, FaBook, FaClock, FaChevronRight, FaBookOpen, FaAward } from 'react-icons/fa';
import { AiFillStar } from 'react-icons/ai';
import Link from "next/link";
import { createClient } from '@/app/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Dummy images for the hero carousel
const heroImages = [
  '/tr19-dashboard.jpg',
  '/tr19-dashboard(2).jpg', 
  '/tr19-dashboard(3).jpg',
];

// Recent activity data
const recentActivity = [
  { id: 1, action: 'Borrowed', book: 'The Midnight Library', date: '2024-05-25', icon: 'BookOpen' },
  { id: 2, action: 'Reserved', book: 'Atomic Habits', date: '2024-05-24', icon: 'Calendar' },
  { id: 3, action: 'Returned', book: 'Dune', date: '2024-05-23', icon: 'Award' },
  { id: 4, action: 'Renewed', book: 'Digital Minimalism', date: '2024-05-22', icon: 'Clock' },
];

// Helper functions
const getBookInitials = (title) => {
  if (!title) return '';
  return title
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const activityIconMap = {
  BookOpen: FaBookOpen,
  Calendar: FaRegCalendarAlt,
  Award: FaAward,
  Clock: FaClock,
};

// Fungsi untuk mengacak dan mengambil n item dari array
function getRandomItems(arr, n) {
  if (!Array.isArray(arr)) return [];
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

// Tambah helper format tanggal
function formatDateDMY(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function UserDashboard() {
  const [currentHero, setCurrentHero] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [interactionRekom, setInteractionRekom] = useState([]);
  const [loadingInteraction, setLoadingInteraction] = useState(true);
  const [interactionCovers, setInteractionCovers] = useState({});
  const [errorInteraction, setErrorInteraction] = useState(null);
  const [displayedRekom, setDisplayedRekom] = useState([]);
  const [isPopularGenre, setIsPopularGenre] = useState(false);
  const [lastBookTitle, setLastBookTitle] = useState('');
  const [loans, setLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [errorLoans, setErrorLoans] = useState(null);
  const [loanCovers, setLoanCovers] = useState({});
  const [firstName, setFirstName] = useState('there');
  const [personalizedRekom, setPersonalizedRekom] = useState([]);
  const [loadingPersonalized, setLoadingPersonalized] = useState(true);
  const [errorPersonalized, setErrorPersonalized] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFirstName = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data, error } = await supabase
          .from('visitors')
          .select('name')
          .eq('id', session.user.id)
          .single();
        if (data && data.name) {
          setFirstName(data.name.split(' ')[0]);
        }
      } catch (err) {
        setFirstName('there');
      }
    };
    fetchFirstName();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const toggleFavorite = (bookId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(bookId)) {
        newFavorites.delete(bookId);
      } else {
        newFavorites.add(bookId);
      }
      return newFavorites;
    });
  };

  useEffect(() => {
    // Fetch Interaction Based Recommendation
    const fetchInteractionRecommendation = async () => {
      setLoadingInteraction(true);
      setErrorInteraction(null);
      try {
        // 1. Ambil user id
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User belum login');
        // 2. Ambil loans terakhir user
        const loansRes = await fetch(`/api/loans?user_id=${user.id}`);
        const loansData = await loansRes.json();
        if (!loansRes.ok || !loansData.loans || loansData.loans.length === 0) {
          // Ambil buku dari genre paling populer
          setIsPopularGenre(true);
          setLastBookTitle('');
          const popularRes = await fetch('/api/genres/popular-books');
          if (!popularRes.ok) throw new Error('Gagal mengambil rekomendasi genre populer');
          const popularData = await popularRes.json();
          setInteractionRekom(popularData.books || []);
          // Ambil cover buku
          if (popularData.books && popularData.books.length > 0) {
            const coverPromises = popularData.books.map(async (rec) => {
              try {
                const res = await fetch(`/api/books/${rec.book_id}`);
                if (!res.ok) return [rec.book_id, null];
                const bookData = await res.json();
                return [rec.book_id, bookData.book?.cover_image || null];
              } catch {
                return [rec.book_id, null];
              }
            });
            const coverResults = await Promise.all(coverPromises);
            const coverMap = {};
            coverResults.forEach(([id, cover]) => {
              coverMap[id] = cover;
            });
            setInteractionCovers(coverMap);
          } else {
            setInteractionCovers({});
          }
          // Ambil 5 random buku untuk ditampilkan
          setDisplayedRekom(getRandomItems(popularData.books || [], 5));
          setLoadingInteraction(false);
          return;
        }
        // 3. Fetch rekomendasi dari backend
        setIsPopularGenre(false);
        const lastLoan = loansData.loans[0];
        setLastBookTitle(lastLoan.book_title1 || '');
        const lastBookId = lastLoan.book_id1;
        const rekomRes = await fetch(`http://localhost:5000/recommendation?book_id=${lastBookId}`);
        if (!rekomRes.ok) throw new Error('Gagal mengambil rekomendasi');
        const rekomData = await rekomRes.json();
        const rekomList = rekomData.rekomendasi || [];
        setInteractionRekom(rekomList);
        // 4. Fetch cover tiap rekomendasi
        if (rekomList.length > 0) {
          const coverPromises = rekomList.map(async (rec) => {
            try {
              const res = await fetch(`/api/books/${rec.book_id}`);
              if (!res.ok) return [rec.book_id, null];
              const bookData = await res.json();
              return [rec.book_id, bookData.book?.cover_image || null];
            } catch {
              return [rec.book_id, null];
            }
          });
          const coverResults = await Promise.all(coverPromises);
          const coverMap = {};
          coverResults.forEach(([id, cover]) => {
            coverMap[id] = cover;
          });
          setInteractionCovers(coverMap);
        } else {
          setInteractionCovers({});
        }
        // Ambil 5 random buku untuk ditampilkan
        setDisplayedRekom(getRandomItems(rekomList, 5));
      } catch (err) {
        setErrorInteraction(err.message || 'Gagal memuat rekomendasi.');
        setInteractionRekom([]);
        setInteractionCovers({});
        setDisplayedRekom([]);
      } finally {
        setLoadingInteraction(false);
      }
    };
    fetchInteractionRecommendation();
  }, []);

  useEffect(() => {
    // Fetch loans user untuk current loans & quick actions
    const fetchLoans = async () => {
      setLoadingLoans(true);
      setErrorLoans(null);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User has not logged in');
        const res = await fetch(`/api/loans?user_id=${user.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mengambil data peminjaman');
        setLoans(data.loans || []);
        // Ambil cover untuk setiap buku yang sedang dipinjam
        const onGoingLoans = (data.loans || []).filter(l => l.status === 'On Going');
        const coverPromises = onGoingLoans.map(async (loan) => {
          if (!loan.book_id1) return [loan.id, null, loan.book_title1];
          try {
            const res = await fetch(`/api/books/${loan.book_id1}`);
            if (!res.ok) return [loan.id, null, loan.book_title1];
            const bookData = await res.json();
            return [loan.id, bookData.book?.cover_image || null, loan.book_title1];
          } catch {
            return [loan.id, null, loan.book_title1];
          }
        });
        const coverResults = await Promise.all(coverPromises);
        const coverMap = {};
        coverResults.forEach(([loanId, cover, title]) => {
          coverMap[loanId] = { cover, title };
        });
        setLoanCovers(coverMap);
      } catch (err) {
        setErrorLoans(err.message || 'Gagal memuat data peminjaman.');
        setLoans([]);
        setLoanCovers({});
      } finally {
        setLoadingLoans(false);
      }
    };
    fetchLoans();
    
    // Listen untuk custom event loanUpdated
    const loanUpdatedHandler = (event) => {
      console.log('loanUpdated event received in dashboard:', event.detail);
      // Immediately refetch loans when loan is updated
      fetchLoans();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('loanUpdated', loanUpdatedHandler);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('loanUpdated', loanUpdatedHandler);
      }
    };
  }, []);

  useEffect(() => {
    const fetchPersonalized = async () => {
      setLoadingPersonalized(true);
      setErrorPersonalized(null);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User belum login');
        const preferencesRes = await fetch(`/api/preferences?user_id=${user.id}`);
        const preferencesData = await preferencesRes.json();
        if (!preferencesData.id) throw new Error('No preferences found');
        const prefId = preferencesData.id;
        console.log('Preference ID sent to Flask:', prefId);
        const res = await fetch(`http://localhost:5001/user-preferences/recommendation?id=${prefId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mengambil rekomendasi personal');
        setPersonalizedRekom(data.recommendations || []);
        console.log('Personalized Recommendations:', data.recommendations);
      } catch (err) {
        setErrorPersonalized(err.message || 'Gagal memuat rekomendasi.');
        setPersonalizedRekom([]);
      } finally {
        setLoadingPersonalized(false);
      }
    };
    fetchPersonalized();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#232310] to-[#5f5f2c]">
      {/* Hero Carousel */}
      <div className="relative w-full h-[400px] overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
              index === currentHero ? 'translate-x-0' : 
              index < currentHero ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <Image
              src={image}
              alt={`Hero ${index + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
        ))}

        {/* Welcome text */}
        <div className="absolute left-8 bottom-8 md:left-16 md:bottom-12 z-10">
          <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Welcome back, <span className="text-[#d9e67b]">{firstName}!</span></h1>
          <p className="text-base text-white/90 max-w-xl drop-shadow">Discover new worlds, continue your reading journey, and manage your library activities with ease.</p>
        </div>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-6 right-8 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHero(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentHero ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center font-manrope">
            <FaFire className="mr-2 text-white" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              className="group flex items-center bg-white rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/60 cursor-pointer"
              onClick={() => router.push('/user/dashboard/books/history')}
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                <FaBook className="text-white text-lg" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">My Loans</span>
              <span className="ml-2 text-xs text-slate-600 font-medium">{loans.length}</span>
              <FaChevronRight className="ml-auto w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
            <button className="group flex items-center bg-white rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/60"
              onClick={() => router.push('/user/dashboard/books/catalog')}
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                <FaRegCalendarAlt className="text-white text-lg" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">Loan a Book</span>
              <FaChevronRight className="ml-auto w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
            <button className="group flex items-center bg-white rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/60"
              onClick={() => router.push('/user/dashboard/reservation/session-reservation')}
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                <FaClock className="text-white text-lg" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">Reserve a Session</span>
              <FaChevronRight className="ml-auto w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
            <button 
              className="group flex items-center bg-white rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/60"
              onClick={() => router.push('/user/dashboard/membership')}
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                <FaUser className="text-white text-lg" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">Membership</span>
              <FaChevronRight className="ml-auto w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </div>
        </section>

        {/* Personalized Recommendation */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center font-manrope">
              <FaStar className="mr-2 text-white" />
              Based On Your Preferences!
            </h2>
            <button className="text-[#d9e67b] hover:text-white font-medium text-sm flex items-center"
              onClick={() => router.push('/user/dashboard/books/recommendation-all-personalized')}
            >
              View All <FaChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="flex space-x-6 overflow-x-auto p-4 scrollbar-hide">
            {loadingPersonalized ? (
              [1,2,3].map((i) => (
                <div key={i} className="flex-none w-48 group animate-pulse">
                  <div className="aspect-[3/4] w-full rounded-2xl bg-gray-200 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : errorPersonalized ? (
              <div className="text-red-500 text-sm">{errorPersonalized}</div>
            ) : personalizedRekom.length === 0 ? (
              <div className="text-gray-500 text-sm">No personalized recommendations available.</div>
            ) : (
              personalizedRekom.map((rec) => (
                <Link
                  key={rec.book_id}
                  href={`/user/dashboard/books/catalog/detail?id=${rec.book_id}`}
                  className="flex-none w-48 group transition-transform duration-200 hover:scale-105"
                >
                  <div className="relative mb-4">
                    <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gray-200 shadow-lg group-hover:shadow-xl group-hover:scale-101 transition-transform duration-300 flex items-center justify-center">
                      <span className="text-[#52570d] font-bold text-3xl select-none">
                        {rec.book_title ? rec.book_title.slice(0,2).toUpperCase() : 'BK'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between min-h-[88px]">
                    <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-[#d9e67b] transition-colors min-h-[40px] max-h-[40px] overflow-hidden">
                      {rec.book_title}
                    </h3>
                    <p className="text-slate-50 text-xs truncate mt-1">{rec.author}</p>
                    <span className="mt-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full w-fit">
                      {rec.genre || rec.genre1 || '-'}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Interaction Based Recommendation */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center font-manrope">
              <FaStar className="mr-2 text-white" />
              {isPopularGenre
                ? 'Popular Genre Recommendations'
                : `Similar to your last borrowed book${lastBookTitle ? `: "${lastBookTitle}"` : ''}`}
            </h2>
            <button className="text-[#d9e67b] hover:text-white font-medium text-sm flex items-center"
              onClick={() => router.push('/user/dashboard/books/recommendation-all-interaction')}
            >
              View All <FaChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="flex space-x-6 overflow-x-auto p-4 scrollbar-hide">
            {loadingInteraction ? (
              [1,2,3].map((i) => (
                <div key={i} className="flex-none w-48 group animate-pulse">
                  <div className="aspect-[3/4] w-full rounded-2xl bg-gray-200 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : errorInteraction ? (
              <div className="text-red-500 text-sm">{errorInteraction}</div>
            ) : displayedRekom.length === 0 ? (
              <div className="text-gray-500 text-sm">Tidak ada rekomendasi berdasarkan interaksi.</div>
            ) : (
              displayedRekom.map((rec) => (
                <Link
                  key={rec.book_id}
                  href={`/user/dashboard/books/catalog/detail?id=${rec.book_id}`}
                  className="flex-none w-48 group transition-transform duration-200 hover:scale-105"
                >
                  <div className="relative mb-4">
                    <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gray-200 shadow-lg group-hover:shadow-xl group-hover:scale-101 transition-transform duration-300 flex items-center justify-center">
                      {interactionCovers[rec.book_id] && interactionCovers[rec.book_id].trim() !== '' ? (
                        <img
                          src={interactionCovers[rec.book_id]}
                          alt={rec.book_title + ' Cover'}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.src = 'https://placehold.co/120x160'; }}
                        />
                      ) : (
                        <span className="text-[#52570d] font-bold text-3xl select-none">{getBookInitials(rec.book_title)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between min-h-[88px]">
                    <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-[#d9e67b] transition-colors min-h-[40px] max-h-[40px] overflow-hidden">
                      {rec.book_title.length > 40 ? rec.book_title.slice(0, rec.book_title.lastIndexOf(' ', 40)) + '...' : rec.book_title}
                    </h3>
                    <p className="text-slate-50 text-xs truncate mt-1">{rec.author}</p>
                    <span className="mt-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full w-fit">
                      {rec.genre || rec.genre1 || '-'}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>


        {/* Current Loans & Reservations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Reservations */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center font-manrope">
              <FaRegCalendarAlt className="mr-2 text-white" />
              Upcoming Reservations
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-14 bg-gradient-to-b from-green-500 to-green-600 rounded"></div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Dune: Part Two</h4>
                      <p className="text-xs text-slate-600">Available: June 1, 2025</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    Ready Soon
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-14 bg-gradient-to-b from-orange-500 to-orange-600 rounded"></div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">The Seven Moons</h4>
                      <p className="text-xs text-slate-600">Queue position: #3</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                    Waiting
                  </span>
                </div>
                <div className="text-center py-8">
                  <span className="text-slate-300 text-2xl">📅</span>
                  <p className="text-slate-500 text-sm">No other reservations</p>
                </div>
              </div>
            </div>
          </section>

          {/* Current Loans */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center font-manrope">
              <FaBookOpen className="mr-2 text-white" />
              Current Loans
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
              <div className="space-y-4">
                {loadingLoans ? (
                  <div className="text-center text-slate-500 py-8">Loading book loand data...</div>
                ) : errorLoans ? (
                  <div className="text-center text-red-500 py-8">{errorLoans}</div>
                ) : loans.filter(l => l.status === 'On Going').length === 0 ? (
                  <div className="text-center text-slate-400 py-8">There is no active book loan.</div>
                ) : (
                  loans.filter(l => l.status === 'On Going').map((loan) => (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition"
                      onClick={() => router.push('/user/dashboard/books/history')}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Cover Buku */}
                        <div className="w-10 h-14 rounded overflow-hidden bg-[#eff0c3] flex items-center justify-center">
                          {loanCovers[loan.id]?.cover ? (
                            <img
                              src={loanCovers[loan.id].cover}
                              alt={loan.book_title1 + ' Cover'}
                              className="w-full h-full object-cover"
                              onError={e => { e.target.src = 'https://placehold.co/80x112'; }}
                            />
                          ) : (
                            <span className="text-[#52570d] font-bold text-lg select-none">
                              {getBookInitials(loanCovers[loan.id]?.title || loan.book_title1)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">{loan.book_title1}</h4>
                          <p className="text-xs text-slate-600">Due: {formatDateDMY(loan.loan_due)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Recent Activity */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center font-manrope">
            <FaClock className="mr-2 text-white" />
            Recent Activity
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activityIconMap[activity.icon];
                return (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <Icon className="text-slate-600 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800">
                        <span className="font-medium">{activity.action}</span> "{activity.book}"
                      </p>
                      <p className="text-xs text-slate-500">{activity.date}</p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">
                      <FaChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}