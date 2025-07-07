import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function GET() {
  try {
    // Memeriksa foreign keys untuk tabel loans
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
      foreignKeys
    });
  } catch (error) {
    console.error('Database foreign keys error:', error);
    
    return Response.json({ 
      success: false,
      message: 'Failed to get foreign keys info',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { 
      status: 500 
    });
  }
} 