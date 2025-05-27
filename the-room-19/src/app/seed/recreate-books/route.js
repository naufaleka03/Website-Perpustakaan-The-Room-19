import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function recreateBooksTable() {
  try {
    // Drop tabel books jika sudah ada
    await sql`DROP TABLE IF EXISTS books CASCADE`;

    // Buat tabel books baru dengan kolom stock
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
      CREATE TABLE IF NOT EXISTS books (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        book_title VARCHAR(255) NOT NULL,
        isbn_code VARCHAR(20),
        language VARCHAR(50),
        author VARCHAR(255) NOT NULL,
        publisher VARCHAR(255) NOT NULL,
        cover_type VARCHAR(50),
        usage VARCHAR(50) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        published_year INTEGER,
        description TEXT,
        book_type VARCHAR(50),
        content_type VARCHAR(50),
        genre VARCHAR(100),
        rating NUMERIC(3, 2) DEFAULT 0.00 NOT NULL,
        cover_image TEXT,
        themes TEXT[],
        stock INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `;
    return true;
  } catch (error) {
    console.error('Error recreating books table:', error);
    throw error;
  }
}

export async function GET() {
  try {
    await recreateBooksTable();
    return Response.json({
      success: true,
      message: 'Books table recreated successfully'
    });
  } catch (error) {
    console.error('Failed to recreate books table:', error);
    return Response.json({
      success: false,
      message: 'Failed to recreate books table',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, {
      status: 500
    });
  }
} 