"use client";
import React, { useState, useEffect } from 'react';
import { FaFire, FaStar, FaUser, FaRegCalendarAlt, FaBook, FaClock, FaChevronRight, FaBookOpen, FaAward } from 'react-icons/fa';
import { AiFillStar } from 'react-icons/ai';
import Link from "next/link";
import { createClient } from '@/app/supabase/client';
import { useRouter } from "next/navigation";

// Dummy images for the hero carousel and books with placeholder gradients
const heroImages = [
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2NmFkMTtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOGI3M2NmO3N0b3Atb3BhY2l0eToxIiAvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNncmFkaWVudDEpIi8+Cjx0ZXh0IHg9IjYwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SGVybyBJbWFnZSAxPC90ZXh0Pgo8L3N2Zz4K',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2Y2OWQ2OTtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmY4YTgwO3N0b3Atb3BhY2l0eToxIiAvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNncmFkaWVudDIpIi8+Cjx0ZXh0IHg9IjYwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SGVybyBJbWFnZSAyPC90ZXh0Pgo8L3N2Zz4K',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM0ZDBjMTtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNDBkNGNmO3N0b3Atb3BhY2l0eToxIiAvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNncmFkaWVudDMpIi8+Cjx0ZXh0IHg9IjYwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SGVybyBJbWFnZSAzPC90ZXh0Pgo8L3N2Zz4K'
];

const recommendedBooks = [
  { 
    id: 1, 
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDE4MCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnMSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2NmFkMTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4YjczY2Y7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjE4MCIgaGVpZ2h0PSIyNTAiIGZpbGw9InVybCgjZzEpIi8+PHRleHQgeD0iOTAiIHk9IjEyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJvb2sgMTwvdGV4dD48L3N2Zz4=',
    title: 'The Midnight Library', 
    author: 'Matt Haig',
    rating: 4.8,
    genre: 'Fiction'
  },
  { 
    id: 2, 
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDE4MCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnMiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2Y2OWQ2OTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZjhhODA7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjE4MCIgaGVpZ2h0PSIyNTAiIGZpbGw9InVybCgjZzIpIi8+PHRleHQgeD0iOTAiIHk9IjEyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJvb2sgMjwvdGV4dD48L3N2Zz4=',
    title: 'Atomic Habits', 
    author: 'James Clear',
    rating: 4.9,
    genre: 'Self-Help'
  },
  { 
    id: 3, 
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDE4MCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnMyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM0ZDBjMTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0MGQ0Y2Y7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjE4MCIgaGVpZ2h0PSIyNTAiIGZpbGw9InVybCgjZzMpIi8+PHRleHQgeD0iOTAiIHk9IjEyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJvb2sgMzwvdGV4dD48L3N2Zz4=',
    title: 'Dune', 
    author: 'Frank Herbert',
    rating: 4.7,
    genre: 'Sci-Fi'
  },
  { 
    id: 4, 
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDE4MCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnNCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2Y1OWU0MjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZjkzMDA7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjE4MCIgaGVpZ2h0PSIyNTAiIGZpbGw9InVybCgjZzQpIi8+PHRleHQgeD0iOTAiIHk9IjEyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJvb2sgNDwvdGV4dD48L3N2Zz4=',
    title: 'The Seven Moons', 
    author: 'Rebecca Ross',
    rating: 4.6,
    genre: 'Fantasy'
  },
  { 
    id: 5, 
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDE4MCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnNSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzllNGVkZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNjMDg0ZmM7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjE4MCIgaGVpZ2h0PSIyNTAiIGZpbGw9InVybCgjZzUpIi8+PHRleHQgeD0iOTAiIHk9IjEyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJvb2sgNTwvdGV4dD48L3N2Zz4=',
    title: 'Digital Minimalism', 
    author: 'Cal Newport',
    rating: 4.5,
    genre: 'Technology'
  },
];

const quickActions = [
  { id: 1, title: 'My Loans', icon: 'BookOpen', color: 'from-blue-500 to-blue-600', count: 3 },
  { id: 2, title: 'Reserve Book', icon: 'Calendar', color: 'from-purple-500 to-purple-600', count: null },
  { id: 3, title: 'Membership', icon: 'User', color: 'from-green-500 to-green-600', count: null },
  { id: 4, title: 'Pay Fines', icon: 'Clock', color: 'from-red-500 to-red-600', count: '$12.50' },
];

const recentActivity = [
  { id: 1, action: 'Borrowed', book: 'The Midnight Library', date: '2024-05-25', icon: 'BookOpen' },
  { id: 2, action: 'Reserved', book: 'Atomic Habits', date: '2024-05-24', icon: 'Calendar' },
  { id: 3, action: 'Returned', book: 'Dune', date: '2024-05-23', icon: 'Award' },
  { id: 4, action: 'Renewed', book: 'Digital Minimalism', date: '2024-05-22', icon: 'Clock' },
];

// getBookInitials function for book cover placeholder
const getBookInitials = (title) => {
  if (!title) return '';
  return title
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

// In recentActivity, use the correct icon:
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
  const router = useRouter();

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
        if (!user) throw new Error('User belum login');
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
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#5f5f2c]">
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
            <img
              src={image}
              alt={`Hero ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Improved seamless gradient transition: taller, starts higher, overlaps bottom */}
        <div className="pointer-events-none absolute left-0 w-full" style={{bottom: '-1px', height: '100px'}}>
          <div className="w-full h-full bg-gradient-to-b from-transparent via-[#5f5f2c]/50 to-[#5f5f2c]" />
        </div>

        {/* Welcome text */}
        <div className="absolute left-8 bottom-8 md:left-16 md:bottom-12 z-10">
          <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Welcome back, <span className="text-[#d9e67b]">Sarah!</span></h1>
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
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <FaFire className="mr-2" />
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
            <button className="group flex items-center bg-white rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/60">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                <FaRegCalendarAlt className="text-white text-lg" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">Reserve Book</span>
              <FaChevronRight className="ml-auto w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
            <button className="group flex items-center bg-white rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/60">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                <FaUser className="text-white text-lg" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">Membership</span>
              <FaChevronRight className="ml-auto w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
            <button className="group flex items-center bg-white rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/60">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                <FaClock className="text-white text-lg" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">Pay Fines</span>
              <span className="ml-2 text-xs text-slate-600 font-medium">$12.50</span>
              <FaChevronRight className="ml-auto w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </div>
        </section>

        {/* Personalized Recommendation */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FaStar className="mr-2 text-yellow-400" />
              Personalized Recommendation
            </h2>
            <button className="text-[#d9e67b] hover:text-white font-medium text-sm flex items-center">
              View All <FaChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="flex space-x-6 overflow-x-auto p-4 scrollbar-hide">
            {recommendedBooks.map((book) => (
              <div key={book.id} className="flex-none w-48 group">
                <div className="relative mb-4">
                  <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gray-200 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-transform duration-300">
                    {book.cover ? (
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500">
                        {getBookInitials(book.title)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-[#d9e67b] transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-slate-50 text-xs">{book.author}</p>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                      {book.genre}
                    </span>
                    <div className="flex items-center">
                      <AiFillStar className="text-yellow-400 w-3 h-3" />
                      <span className="text-xs text-white ml-1">{book.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interaction Based Recommendation */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FaStar className="mr-2 text-yellow-400" />
              {isPopularGenre
                ? 'Rekomendasi Genre Populer'
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
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="text-purple-600">📅</span>
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
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="text-blue-600">📚</span>
              Current Loans
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
              <div className="space-y-4">
                {loadingLoans ? (
                  <div className="text-center text-slate-500 py-8">Memuat data peminjaman...</div>
                ) : errorLoans ? (
                  <div className="text-center text-red-500 py-8">{errorLoans}</div>
                ) : loans.filter(l => l.status === 'On Going').length === 0 ? (
                  <div className="text-center text-slate-400 py-8">Tidak ada peminjaman aktif.</div>
                ) : (
                  loans.filter(l => l.status === 'On Going').map((loan) => (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition"
                      onClick={() => router.push('/user/dashboard/books/history')}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Cover Buku */}
                        <div className="w-10 h-14 rounded overflow-hidden bg-gradient-to-b bg-[#eff0c3] flex items-center justify-center">
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
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="text-green-600">⌛</span>
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