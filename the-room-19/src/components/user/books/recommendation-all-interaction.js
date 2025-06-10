"use client";
import React, { useEffect, useState } from "react";
import { createClient } from '@/app/supabase/client';
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";

function getBookInitials(title) {
  if (!title) return '';
  return title.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
}

export default function RecommendationAllInteraction() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPopularGenre, setIsPopularGenre] = useState(false);
  const [lastBookTitle, setLastBookTitle] = useState('');
  const [covers, setCovers] = useState({});

  useEffect(() => {
    const fetchRecommendation = async () => {
      setLoading(true);
      setError(null);
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
          setBooks(popularData.books || []);
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
            setCovers(coverMap);
          } else {
            setCovers({});
          }
          setLoading(false);
          return;
        }
        // 3. Fetch rekomendasi dari backend (top_n=15)
        setIsPopularGenre(false);
        const lastLoan = loansData.loans[0];
        setLastBookTitle(lastLoan.book_title1 || '');
        const lastBookId = lastLoan.book_id1;
        const rekomRes = await fetch(`http://localhost:5000/recommendation?book_id=${lastBookId}&top_n=15`);
        if (!rekomRes.ok) throw new Error('Gagal mengambil rekomendasi');
        const rekomData = await rekomRes.json();
        const rekomList = rekomData.rekomendasi || [];
        setBooks(rekomList);
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
          setCovers(coverMap);
        } else {
          setCovers({});
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat rekomendasi.');
        setBooks([]);
        setCovers({});
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendation();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#5f5f2c] pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ml-4">
        <div className="flex items-center mb-8">
          <Link href="/user/dashboard">
            <button className="flex items-center text-white hover:text-[#d9e67b] font-medium text-sm mr-4">
              <FaChevronLeft className="w-4 h-4 mr-1" /> Dashboard
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-white ml-2">
            {isPopularGenre ? 'Rekomendasi Genre Populer' : `Rekomendasi Buku Mirip${lastBookTitle ? `: "${lastBookTitle}"` : ''}`}
          </h1>
        </div>
        {loading ? (
          <div className="text-center text-white py-12">Memuat rekomendasi buku...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">{error}</div>
        ) : books.length === 0 ? (
          <div className="text-center text-slate-200 py-12">Tidak ada rekomendasi tersedia.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
            {books.map((rec, idx) => (
              <Link
                key={rec.book_id + '-' + idx}
                href={`/user/dashboard/books/catalog/detail?id=${rec.book_id}`}
                className="group"
              >
                <div className="relative mb-4">
                  <div className="w-[180px] h-[250px] rounded-2xl overflow-hidden bg-gray-200 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                    {covers[rec.book_id] && covers[rec.book_id].trim() !== '' ? (
                      <img
                        src={covers[rec.book_id]}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 