import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function recreateLoansTable() {
  try {
    // Drop tabel loans jika sudah ada
    await sql`DROP TABLE IF EXISTS loans CASCADE`;
    
    // Buat tabel loans baru dengan referensi ke visitors
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    await sql`
      CREATE TABLE IF NOT EXISTS loans (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
        book_id1 UUID REFERENCES books(id) ON DELETE SET NULL NOT NULL,
        book_id2 UUID REFERENCES books(id) ON DELETE SET NULL,
        book_title1 VARCHAR(255) NOT NULL,
        book_title2 VARCHAR(255),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        loan_start DATE NOT NULL DEFAULT CURRENT_DATE,
        loan_due DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
        status VARCHAR(50) DEFAULT 'On Going' NOT NULL,
        extend_count INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `;
    
    return true;
  } catch (error) {
    console.error('Error recreating loans table:', error);
    throw error;
  }
}

export async function GET() {
  try {
    await recreateLoansTable();

    return Response.json({ 
      success: true,
      message: 'Loans table recreated successfully' 
    });
  } catch (error) {
    console.error('Failed to recreate loans table:', error);
    
    return Response.json({ 
      success: false,
      message: 'Failed to recreate loans table',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { 
      status: 500 
    });
  }
} 