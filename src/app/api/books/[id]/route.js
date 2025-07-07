import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

// Helper function to update genre book counts
async function updateGenreBookCount(genreName) {
  if (!genreName) return;

  try {
    // Get the current count of books with this genre
    const books = await sql`
      SELECT COUNT(*) as count FROM books 
      WHERE genre = ${genreName}
    `;

    const count = books[0]?.count || 0;

    // Update the genre count in the genres table
    await sql`
      UPDATE genres 
      SET number_of_books = ${count}
      WHERE genre_name = ${genreName}
    `;

    console.log(`Updated book count for genre ${genreName}: ${count}`);
  } catch (error) {
    console.error(`Error updating genre count for ${genreName}:`, error);
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const books = await sql`
      SELECT * FROM books WHERE id = ${id}
    `;

    if (books.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({ book: books[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json({ error: "Error fetching book" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // First, check if the book exists and get its genre
    const books = await sql`
      SELECT id, genre FROM books WHERE id = ${id}
    `;

    if (books.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const bookGenre = books[0].genre;

    // If book exists, delete it
    await sql`DELETE FROM books WHERE id = ${id}`;

    // Update genre book count if the book had a genre
    if (bookGenre) {
      await updateGenreBookCount(bookGenre);
    }

    return NextResponse.json(
      { message: "Book deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check if book exists and get its current genre
    const existingBooks = await sql`
      SELECT id, genre FROM books WHERE id = ${id}
    `;

    if (existingBooks.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const oldGenre = existingBooks[0].genre;
    const newGenre = body.genre;

    // Update the book
    const updatedBooks = await sql`
      UPDATE books
      SET 
        book_title = ${body.book_title},
        isbn_code = ${body.isbn_code},
        language = ${body.language},
        author = ${body.author},
        publisher = ${body.publisher},
        published_year = ${body.published_year},
        description = ${body.description},
        book_type = ${body.book_type},
        content_type = ${body.content_type},
        genre = ${body.genre},
        cover_image = ${body.cover_image},
        rating = ${body.rating},
        cover_type = ${body.cover_type},
        usage = ${body.usage},
        price = ${body.price},
        themes = ${body.themes || []},
        stock = COALESCE(${body.stock}, stock)
      WHERE id = ${id}
      RETURNING *
    `;

    // Update genre book counts if the genre has changed
    if (oldGenre !== newGenre) {
      if (oldGenre) {
        await updateGenreBookCount(oldGenre);
      }
      if (newGenre) {
        await updateGenreBookCount(newGenre);
      }
    }

    return NextResponse.json({ book: updatedBooks[0] }, { status: 200 });
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    );
  }
}
