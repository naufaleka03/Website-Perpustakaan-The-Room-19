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
  if (book_id) {
    // Return all copies for this book
    try {
      const copies = await sql`
        SELECT id, copy, condition, status, comment, updated_at
        FROM manage_books
        WHERE book_id = ${book_id} AND is_retired = false
        ORDER BY copy ASC
      `;
      return NextResponse.json({ success: true, data: copies });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }
  try {
    const books = await sql`
      SELECT mb.id, mb.book_id, mb.copy, mb.condition, mb.status, mb.comment, b.book_title
      FROM manage_books mb
      JOIN books b ON mb.book_id = b.id
      WHERE mb.is_retired = false
      ORDER BY b.book_title ASC, mb.copy ASC
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
    // Find available copy numbers (1,2,3)
    const maxCopies = 3;
    const availableCopies = [];
    for (let i = 1; i <= maxCopies; i++) {
      if (!existingCopies.includes(i)) availableCopies.push(i);
    }
    if (availableCopies.length === 0) {
      return NextResponse.json(
        { success: false, error: "Maximum 3 copies per book allowed." },
        { status: 400 }
      );
    }
    // Only add up to the number of available copies
    const toAdd = Math.min(numCopies, availableCopies.length);
    const inserts = [];
    for (let i = 0; i < toAdd; i++) {
      inserts.push(
        sql`
          INSERT INTO manage_books (book_id, copy, condition, status)
          VALUES (${book_id}, ${availableCopies[i]}, ${
          condition || "Not Specified"
        }, 'Available')
          RETURNING *
        `
      );
    }
    const inserted = await Promise.all(inserts);
    const results = inserted.map((r) => r[0]);
    // If user requested more than available, inform them
    let message = undefined;
    if (numCopies > toAdd) {
      message = `Only ${toAdd} copy/copies added. Maximum 3 copies per book allowed.`;
    }
    // After adding, update the main book stock
    if (results.length > 0) {
      await updateBookStock(book_id);
    }
    return NextResponse.json(
      { success: true, data: results, message },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update condition and comment for a managed book, or retire book
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, condition, comment, retire } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 }
      );
    }
    if (retire === true) {
      // Soft delete (retire) the book
      // Get book info for logging
      const bookRows = await sql`
        SELECT mb.*, b.book_title FROM manage_books mb JOIN books b ON mb.book_id = b.id WHERE mb.id = ${id}
      `;
      if (bookRows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Entry not found" },
          { status: 404 }
        );
      }
      const book = bookRows[0];
      // Mark as retired
      await sql`
        UPDATE manage_books SET is_retired = true, status = 'Retired' WHERE id = ${id}
      `;
      // Insert log to inventory_logs
      const handle_by = body.handle_by || null;
      await sql`
        INSERT INTO inventory_logs (mode, item_name, stock_before, stock_after, comment, created_at, handle_by)
        VALUES ('reduce', ${
          book.book_title + " (copy " + book.copy + ")"
        }, 1, 0, 'Retired (damaged and removed from inventory)', NOW(), ${handle_by})
      `;
      // After retiring, update the main book stock
      await updateBookStock(book.book_id);
      return NextResponse.json({ success: true });
    }
    // Default: update condition/comment
    if (!condition) {
      return NextResponse.json(
        { success: false, error: "condition is required if not retiring" },
        { status: 400 }
      );
    }
    const result = await sql`
      UPDATE manage_books
      SET condition = ${condition}, comment = ${comment || null}
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

// DELETE: Remove a managed book (retire book)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 }
      );
    }
    // We need to know the book_id before deleting
    const beforeDelete = await sql`
      SELECT book_id FROM manage_books WHERE id = ${id}
    `;
    if (beforeDelete.length === 0) {
      return NextResponse.json(
        { success: false, error: "Entry not found" },
        { status: 404 }
      );
    }
    const { book_id } = beforeDelete[0];

    const result = await sql`
      DELETE FROM manage_books WHERE id = ${id} RETURNING *
    `;

    // After deleting, update the main book stock
    await updateBookStock(book_id);

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
