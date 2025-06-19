import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

// GET: List all managed books
export async function GET(request) {
  try {
    const books = await sql`
      SELECT mb.id, mb.book_id, mb.copies, mb.status, mb.comment, b.book_title
      FROM manage_books mb
      JOIN books b ON mb.book_id = b.id
      ORDER BY mb.id DESC
    `;
    return NextResponse.json({ success: true, data: books });
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
    const { book_id, copies } = body;
    if (!book_id || typeof copies !== "number" || copies < 1) {
      return NextResponse.json(
        { success: false, error: "book_id and copies (>=1) are required" },
        { status: 400 }
      );
    }
    let results = [];
    if (copies === 1) {
      const result = await sql`
        INSERT INTO manage_books (book_id, copies, status)
        VALUES (${book_id}, 1, 'Not Specified')
        RETURNING *
      `;
      results = [result[0]];
    } else {
      // Multiple inserts, each with copies=1,2,3,...
      const inserts = [];
      for (let i = 1; i <= copies; i++) {
        inserts.push(
          sql`
            INSERT INTO manage_books (book_id, copies, status)
            VALUES (${book_id}, ${i}, 'Not Specified')
            RETURNING *
          `
        );
      }
      // Run all inserts in parallel
      const inserted = await Promise.all(inserts);
      results = inserted.map((r) => r[0]);
    }
    return NextResponse.json({ success: true, data: results }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update status and comment for a managed book
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status, comment } = body;
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "id and status are required" },
        { status: 400 }
      );
    }
    const result = await sql`
      UPDATE manage_books
      SET status = ${status}, comment = ${comment || null}
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
