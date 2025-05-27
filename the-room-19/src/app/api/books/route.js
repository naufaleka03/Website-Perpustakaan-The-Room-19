import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET() {
  try {
    const books = await sql`
      SELECT id, book_title, stock
      FROM books
      ORDER BY book_title ASC
    `;

    return Response.json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return Response.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      book_title,
      isbn_code,
      language,
      author,
      publisher,
      cover_type,
      usage,
      price,
      published_year,
      description,
      book_type,
      content_type,
      genre,
      cover_image,
      themes,
    } = body;

    // Validate required fields
    if (!book_title || !author || !publisher || !usage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO books (
        book_title, 
        isbn_code, 
        language, 
        author, 
        publisher, 
        cover_type, 
        usage, 
        price, 
        published_year, 
        description, 
        book_type, 
        content_type,
        genre,
        cover_image,
        themes
      ) VALUES (
        ${book_title}, 
        ${isbn_code}, 
        ${language}, 
        ${author}, 
        ${publisher}, 
        ${cover_type}, 
        ${usage}, 
        ${price}, 
        ${published_year}, 
        ${description}, 
        ${book_type}, 
        ${content_type},
        ${genre},
        ${cover_image},
        ${themes || []}
      ) RETURNING *
    `;

    return NextResponse.json({ book: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json({ error: "Error creating book" }, { status: 500 });
  }
}
