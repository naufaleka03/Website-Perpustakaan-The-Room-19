import postgres from 'postgres';

// Langsung gunakan PostgreSQL untuk menghindari masalah dengan cookies
const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

// Gunakan koneksi database langsung untuk menghindari masalah dengan cookies
export async function GET(request) {
  try {
    // Langsung query database tanpa menggunakan Supabase client
    const loansData = await sql`SELECT * FROM loans`;
    
    return Response.json({ loans: loansData });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return Response.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}

// POST handler untuk membuat loan baru
export async function POST(request) {
  try {
    const requestData = await request.json();

    // Validasi input
    const requiredFields = ['user_id', 'book_id1', 'book_title1', 'full_name', 'email', 'phone_number'];
    for (const field of requiredFields) {
      if (!requestData[field]) {
        return Response.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Buat record loan baru
    const newLoan = {
      user_id: requestData.user_id,
      book_id1: requestData.book_id1,
      book_id2: requestData.book_id2 || null,
      book_title1: requestData.book_title1,
      book_title2: requestData.book_title2 || null,
      full_name: requestData.full_name,
      email: requestData.email,
      phone_number: requestData.phone_number,
      loan_start: new Date().toISOString().split('T')[0], // Format tanggal YYYY-MM-DD
      loan_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 hari dari sekarang
      status: 'On Going'
    };

    try {
      // Gunakan PostgreSQL langsung daripada Supabase
      const insertedLoan = await sql`
        INSERT INTO loans ${sql(newLoan, 
          'user_id', 'book_id1', 'book_id2', 'book_title1', 'book_title2', 
          'full_name', 'email', 'phone_number', 'loan_start', 'loan_due', 'status'
        )}
        RETURNING *
      `;
      
      if (insertedLoan && insertedLoan.length > 0) {
        return Response.json({ success: true, loan: insertedLoan[0] }, { status: 201 });
      } else {
        throw new Error('Failed to insert loan record');
      }
    } catch (sqlError) {
      console.error('SQL error:', sqlError);
      return Response.json(
        { error: 'Failed to create loan', details: sqlError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return Response.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 