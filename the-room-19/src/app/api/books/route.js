import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const bookType = searchParams.get('bookType');
    const searchQuery = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const offset = (page - 1) * limit;

    // Build the SQL query with conditions
    let conditions = [];
    let queryParams = [];

    if (genre) {
      conditions.push(`genre = $${queryParams.length + 1}`);
      queryParams.push(genre);
    }

    if (bookType) {
      conditions.push(`book_type = $${queryParams.length + 1}`);
      queryParams.push(bookType);
    }

    if (searchQuery) {
      conditions.push(`(book_title ILIKE $${queryParams.length + 1} OR author ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${searchQuery}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count for pagination
    const totalResult = await sql.unsafe(
      `SELECT COUNT(*) as count FROM books ${whereClause}`,
      queryParams
    );
    const total = parseInt(totalResult[0]?.count || '0', 10);

    // Get paginated books
    const books = await sql.unsafe(
      `
      SELECT * FROM books
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${queryParams.length + 1}
      OFFSET $${queryParams.length + 2}
      `,
      [...queryParams, limit, offset]
    );

    return NextResponse.json({ books, total });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Error fetching books' }, { status: 500 });
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
      themes
    } = body;
    
    // Validate required fields
    if (!book_title || !author || !publisher || !usage) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
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
        themes,
        stock
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
        ${themes || []},
        0
      ) RETURNING *
    `;
    
    // Update genre book count
    if (genre) {
      await updateGenreBookCount(genre);
    }
    
    return NextResponse.json({ book: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Error creating book' }, { status: 500 });
  }
} 