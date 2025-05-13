import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const bookType = searchParams.get('bookType');
    const searchQuery = searchParams.get('search');
    
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
    
    const books = await sql.unsafe(`
      SELECT * FROM books
      ${whereClause}
      ORDER BY created_at DESC
    `, queryParams);
    
    return NextResponse.json({ books });
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
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Error creating book' }, { status: 500 });
  }
} 