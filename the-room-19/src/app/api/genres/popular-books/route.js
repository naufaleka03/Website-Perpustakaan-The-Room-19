import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function GET() {
  try {
    // 1. Cari genre paling populer berdasarkan jumlah peminjaman (pakai genre1 dari loans)
    const popularGenreResult = await sql`
      SELECT l.genre1 as genre, COUNT(*) as borrow_count
      FROM loans l
      WHERE l.genre1 IS NOT NULL AND l.genre1 <> ''
      GROUP BY l.genre1
      ORDER BY borrow_count DESC
      LIMIT 1
    `;
    let popularGenre = null;
    if (popularGenreResult && popularGenreResult.length > 0) {
      popularGenre = popularGenreResult[0].genre;
    } else {
      // Fallback: cari genre dengan jumlah buku terbanyak
      const fallbackGenreResult = await sql`
        SELECT genre, COUNT(*) as book_count
        FROM books
        WHERE genre IS NOT NULL AND genre <> ''
        GROUP BY genre
        ORDER BY book_count DESC
        LIMIT 1
      `;
      if (fallbackGenreResult && fallbackGenreResult.length > 0) {
        popularGenre = fallbackGenreResult[0].genre;
      }
    }
    if (!popularGenre) {
      return NextResponse.json({ books: [] });
    }
    // 2. Ambil beberapa buku dari genre tersebut
    const books = await sql`
      SELECT id as book_id, book_title, author, genre
      FROM books
      WHERE genre = ${popularGenre}
      LIMIT 20
    `;
    return NextResponse.json({ books });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Gagal mengambil buku genre populer' }, { status: 500 });
  }
} 