import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function GET() {
  try {
    // Memeriksa tabel loans
    const tableInfo = await sql`
      SELECT 
        c.table_name, 
        c.column_name, 
        c.data_type,
        tc.constraint_type,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM 
        information_schema.columns c
      LEFT JOIN 
        information_schema.constraint_column_usage ccu 
          ON c.column_name = ccu.column_name 
          AND c.table_name = ccu.table_name
      LEFT JOIN 
        information_schema.table_constraints tc 
          ON ccu.constraint_name = tc.constraint_name
      WHERE 
        c.table_name = 'loans'
    `;
    
    return Response.json({
      success: true,
      tableInfo
    });
  } catch (error) {
    console.error('Database info error:', error);
    
    return Response.json({ 
      success: false,
      message: 'Failed to get database info',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { 
      status: 500 
    });
  }
} 