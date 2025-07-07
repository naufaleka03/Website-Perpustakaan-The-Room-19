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
  }
}

// GET: Get specific managed book by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const copies = await sql`
      SELECT id, copy, condition, status, comment, updated_at, is_retired, book_id
      FROM manage_books
      WHERE id = ${id}
    `;

    if (copies.length === 0) {
      return NextResponse.json(
        { success: false, error: "Managed book not found" },
        { status: 404 }
      );
    }

    const copy = copies[0];

    // Check if this copy is currently on loan
    const loans = await sql`
      SELECT id, status FROM loans WHERE copies_id = ${id} AND status = 'On Going'
    `;

    let dynamic_status = copy.status;
    if (copy.is_retired) {
      dynamic_status = "Retired";
    } else if (loans.length > 0) {
      dynamic_status = "On Loan";
    } else if (copy.status === "Retired") {
      dynamic_status = "Retired";
    } else {
      dynamic_status = "Available";
    }

    const result = { ...copy, dynamic_status };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update condition and comment for a managed book, or retire book
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { condition, comment, retire, handle_by } = body;

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
      await sql`
        INSERT INTO inventory_logs (mode, item_name, stock_before, stock_after, comment, created_at, handle_by)
        VALUES ('reduce', ${
          book.book_title + " (copy " + book.copy + ")"
        }, 1, 0, 'Retired (damaged and removed from inventory)', NOW(), ${
        handle_by || null
      })
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
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

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
