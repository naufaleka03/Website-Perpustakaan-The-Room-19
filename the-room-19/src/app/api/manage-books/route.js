import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

async function updateBookStock(book_id) {
  try {
    // 1. Count active copies for the book
    const countResult = await sql`
      SELECT COUNT(*) as active_copies
      FROM manage_books
      WHERE book_id = ${book_id} AND is_retired = false
    `;
    const activeCopies = countResult[0].active_copies;

    // 2. Update the stock in the books table
    await sql`
      UPDATE books
      SET stock = ${activeCopies}
      WHERE id = ${book_id}
    `;
    console.log(`Stock for book ${book_id} updated to ${activeCopies}`);
  } catch (error) {
    console.error(`Failed to update stock for book ${book_id}:`, error);
    // We don't re-throw the error, as the primary operation (POST/PATCH/DELETE) might have succeeded.
    // Logging is important here.
  }
}

// GET: List all managed books
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const book_id = searchParams.get("id");
  try {
    let copies;
    if (book_id) {
      // Return all copies for this book
      copies = await sql`
        SELECT id, copy, condition, status, comment, updated_at, is_retired
        FROM manage_books
        WHERE book_id = ${book_id}
        ORDER BY copy ASC
      `;
    } else {
      // Return all copies for all books
      copies = await sql`
        SELECT mb.id, mb.book_id, mb.copy, mb.condition, mb.status, mb.comment, mb.updated_at, mb.is_retired, b.book_title
        FROM manage_books mb
        JOIN books b ON mb.book_id = b.id
        ORDER BY b.book_title ASC, mb.copy ASC
      `;
    }
    // For each copy, determine dynamic status
    const copyIds = copies.map((c) => c.id);
    let loans = [];
    if (copyIds.length > 0) {
      loans = await sql`
        SELECT id, copies_id, status FROM loans WHERE copies_id = ANY(${copyIds}) AND status = 'On Going'
      `;
    }
    const loanMap = new Map();
    for (const loan of loans) {
      loanMap.set(loan.copies_id, loan);
    }
    const result = copies.map((copy) => {
      let dynamic_status = copy.status;
      if (copy.is_retired) {
        dynamic_status = "Retired";
      } else if (loanMap.has(copy.id)) {
        dynamic_status = "On Loan";
      } else if (copy.status === "Retired") {
        dynamic_status = "Retired";
      } else {
        dynamic_status = "Available";
      }
      return { ...copy, dynamic_status };
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a book to managed books
export async function POST(request) {
  try {
    const body = await request.json();
    const { book_id, copies: numCopies, condition } = body;
    if (!book_id || typeof numCopies !== "number" || numCopies < 1) {
      return NextResponse.json(
        { success: false, error: "book_id and copies (>=1) are required" },
        { status: 400 }
      );
    }
    // Check existing copies for this book
    const existing = await sql`
      SELECT copy FROM manage_books WHERE book_id = ${book_id} ORDER BY copy ASC
    `;
    const existingCopies = existing.map((row) => row.copy);
    // Cari nomor copy berikutnya yang belum dipakai, tanpa batas maksimal
    let nextCopy = 1;
    if (existingCopies.length > 0) {
      // Cari copy terbesar, lalu lanjutkan
      nextCopy = Math.max(...existingCopies) + 1;
    }
    const inserts = [];
    for (let i = 0; i < numCopies; i++) {
      inserts.push(
        sql`
          INSERT INTO manage_books (book_id, copy, condition, status)
          VALUES (${book_id}, ${nextCopy + i}, ${
          condition || "Not Specified"
        }, 'Available')
          RETURNING *
        `
      );
    }
    const inserted = await Promise.all(inserts);
    const results = inserted.map((r) => r[0]);
    // Setelah menambah, update stok utama buku
    if (results.length > 0) {
      await updateBookStock(book_id);
    }
    return NextResponse.json({ success: true, data: results }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
