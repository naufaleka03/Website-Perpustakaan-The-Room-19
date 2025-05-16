import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function fixLoansTable() {
  try {
    // Cara 1: Drop tabel loans jika sudah ada
    console.log('Dropping loans table...');
    await sql`DROP TABLE IF EXISTS loans CASCADE`;
    
    // Cara 2: Buat tabel loans baru dengan referensi ke visitors
    console.log('Creating new loans table...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    await sql`
      CREATE TABLE IF NOT EXISTS loans (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
        book_id1 UUID REFERENCES books(id) ON DELETE SET NULL NOT NULL,
        book_id2 UUID REFERENCES books(id) ON DELETE SET NULL,
        book_title1 VARCHAR(255) NOT NULL,
        book_title2 VARCHAR(255),
        genre1 VARCHAR(100) NOT NULL,
        genre2 VARCHAR(100),
        cover_image1 TEXT,
        cover_image2 TEXT,
        price1 NUMERIC(10, 2) NOT NULL,
        price2 NUMERIC(10, 2),
        total_price NUMERIC(10, 2) GENERATED ALWAYS AS (
          COALESCE(price1, 0) + COALESCE(price2, 0)
        ) STORED,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        loan_start DATE NOT NULL DEFAULT CURRENT_DATE,
        loan_due DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
        status VARCHAR(50) DEFAULT 'On Going' NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `;
    
    // Opsional: Buat beberapa data contoh
    /*
    await sql`
      INSERT INTO loans (user_id, book_id1, book_title1, full_name, email, phone_number)
      SELECT 
        v.id, 
        b.id, 
        b.book_title, 
        v.name, 
        v.email, 
        v.phone_number
      FROM 
        visitors v, 
        books b
      LIMIT 1
    `;
    */
    
    return true;
  } catch (error) {
    console.error('Error fixing loans table:', error);
    throw error;
  }
}

export async function GET() {
  try {
    await fixLoansTable();

    // Periksa foreign keys setelah perubahan
    const foreignKeys = await sql`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'loans'
    `;

    return Response.json({ 
      success: true,
      message: 'Loans table fixed successfully',
      foreignKeys
    });
  } catch (error) {
    console.error('Failed to fix loans table:', error);
    
    return Response.json({ 
      success: false,
      message: 'Failed to fix loans table',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { 
      status: 500 
    });
  }
} 