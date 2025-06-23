import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function recreateTransactionTable() {
  try {
    // Drop tabel transaction jika sudah ada
    await sql`DROP TABLE IF EXISTS transaction CASCADE`;

    // Buat tabel transaction baru
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
      CREATE TABLE IF NOT EXISTS transaction (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
        payment_id VARCHAR(255),
        payment_status VARCHAR(50),
        payment_method VARCHAR(50),
        amount NUMERIC(12,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `;
    return true;
  } catch (error) {
    console.error('Error recreating transaction table:', error);
    throw error;
  }
}

export async function GET() {
  try {
    await recreateTransactionTable();
    return Response.json({ 
      success: true,
      message: 'Transaction table recreated successfully' 
    });
  } catch (error) {
    return Response.json({ 
      success: false,
      message: 'Failed to recreate transaction table',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { 
      status: 500 
    });
  }
} 