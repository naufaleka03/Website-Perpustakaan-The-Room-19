import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const books = await sql`
      SELECT * FROM books WHERE id = ${id}
    `;
    
    if (books.length === 0) {
      return NextResponse.json(
        { error: 'Book not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ book: books[0] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json({ error: 'Error fetching book' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // First, check if the book exists
    const books = await sql`
      SELECT id FROM books WHERE id = ${id}
    `;
    
    if (books.length === 0) {
      return NextResponse.json(
        { error: 'Book not found' }, 
        { status: 404 }
      );
    }
    
    // If book exists, delete it
    await sql`DELETE FROM books WHERE id = ${id}`;
    
    return NextResponse.json(
      { message: 'Book deleted successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Check if book exists
    const existingBooks = await sql`
      SELECT id FROM books WHERE id = ${id}
    `;
    
    if (existingBooks.length === 0) {
      return NextResponse.json(
        { error: 'Book not found' }, 
        { status: 404 }
      );
    }
    
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
        price = ${body.price}
      WHERE id = ${id}
      RETURNING *
    `;
    
    return NextResponse.json(
      { book: updatedBooks[0] }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: 'Failed to update book' }, 
      { status: 500 }
    );
  }
} 