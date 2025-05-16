import postgres from 'postgres';

// Langsung gunakan PostgreSQL untuk menghindari masalah dengan cookies
const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

// Gunakan koneksi database langsung untuk menghindari masalah dengan cookies
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    let loansData;
    if (userId) {
      // Jika ada user_id, ambil data peminjaman untuk user tersebut
      loansData = await sql`
        SELECT * FROM loans 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
    } else {
      // Jika tidak ada user_id, ambil semua data peminjaman
      loansData = await sql`
        SELECT * FROM loans
        ORDER BY created_at DESC
      `;
    }
    
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

    // Validasi input yang wajib ada
    const requiredFields = ['user_id', 'book_id1', 'book_title1', 'genre1', 'cover_image1', 'price1', 'full_name', 'email', 'phone_number'];
    const missingFields = requiredFields.filter(field => !requestData[field]);
    
    if (missingFields.length > 0) {
      return Response.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Buat record loan baru
    const newLoan = {
      user_id: requestData.user_id,
      book_id1: requestData.book_id1,
      book_id2: requestData.book_id2 || null,
      book_title1: requestData.book_title1,
      book_title2: requestData.book_title2 || null,
      genre1: requestData.genre1,
      genre2: requestData.genre2 || null,
      cover_image1: requestData.cover_image1,
      cover_image2: requestData.cover_image2 || null,
      price1: requestData.price1,
      price2: requestData.price2 || null,
      full_name: requestData.full_name,
      email: requestData.email,
      phone_number: requestData.phone_number,
      loan_start: new Date().toISOString().split('T')[0], // Format tanggal YYYY-MM-DD
      loan_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 hari dari sekarang
      status: 'On Going'
    };

    try {
      // Gunakan PostgreSQL langsung
      const insertedLoan = await sql`
        INSERT INTO loans ${sql(newLoan, 
          'user_id', 'book_id1', 'book_id2', 'book_title1', 'book_title2', 
          'genre1', 'genre2', 'cover_image1', 'cover_image2', 'price1', 'price2',
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