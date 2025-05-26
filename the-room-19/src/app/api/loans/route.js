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
    const requiredFields = ['user_id', 'book_id1', 'book_title1', 'genre1', 'price1', 'full_name', 'email', 'phone_number'];
    const missingFields = requiredFields.filter(field => !requestData[field]);
    
    if (missingFields.length > 0) {
      return Response.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Gunakan waktu WIB (Asia/Jakarta) untuk tanggal
    const now = new Date();
    const wibOffset = 7 * 60; // WIB = UTC+7 dalam menit
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wibDate = new Date(utc + (wibOffset * 60000));
    const loan_start = wibDate.toISOString().split('T')[0];
    const loan_due = new Date(wibDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Buat record loan baru
    const newLoan = {
      user_id: requestData.user_id,
      book_id1: requestData.book_id1,
      book_id2: requestData.book_id2 || null,
      book_title1: requestData.book_title1,
      book_title2: requestData.book_title2 || null,
      genre1: requestData.genre1,
      genre2: requestData.genre2 || null,
      cover_image1: requestData.cover_image1 || null,
      cover_image2: requestData.cover_image2 || null,
      price1: requestData.price1,
      price2: requestData.price2 || null,
      full_name: requestData.full_name,
      email: requestData.email,
      phone_number: requestData.phone_number,
      loan_start: loan_start, // Format tanggal YYYY-MM-DD WIB
      loan_due: loan_due, // 7 hari dari sekarang (WIB)
      status: 'On Going'
    };

    try {
      // Insert ke tabel loans
      const insertedLoan = await sql`
        INSERT INTO loans ${sql(newLoan, 
          'user_id', 'book_id1', 'book_id2', 'book_title1', 'book_title2', 
          'genre1', 'genre2', 'cover_image1', 'cover_image2', 'price1', 'price2',
          'full_name', 'email', 'phone_number', 'loan_start', 'loan_due', 'status'
        )}
        RETURNING *
      `;
      let transactionRow = null;
      if (insertedLoan && insertedLoan.length > 0 && (requestData.payment_id || requestData.payment_status || requestData.payment_method)) {
        // Insert ke tabel transaction jika ada data payment
        const transactionData = {
          loan_id: insertedLoan[0].id,
          payment_id: requestData.payment_id || null,
          payment_status: requestData.payment_status || null,
          payment_method: requestData.payment_method || null
        };
        const insertedTransaction = await sql`
          INSERT INTO transaction ${sql(transactionData, 'loan_id', 'payment_id', 'payment_status', 'payment_method')}
          RETURNING *
        `;
        transactionRow = insertedTransaction && insertedTransaction.length > 0 ? insertedTransaction[0] : null;
      }
      if (insertedLoan && insertedLoan.length > 0) {
        return Response.json({ success: true, loan: insertedLoan[0], transaction: transactionRow }, { status: 201 });
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

// PATCH handler untuk update status Over Due
export async function PATCH(request) {
  try {
    // Hitung tanggal hari ini (WIB)
    const now = new Date();
    const wibOffset = 7 * 60; // WIB = UTC+7 dalam menit
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wibNow = new Date(utc + (wibOffset * 60000));
    const todayWIB = wibNow.toISOString().split('T')[0];

    // Update semua loan yang return_date < hari ini (WIB) dan status masih 'On Going'
    const updated = await sql`
      UPDATE loans
      SET status = 'Over Due'
      WHERE status = 'On Going' AND loan_due < ${todayWIB}
      RETURNING *
    `;
    return Response.json({ success: true, updated_count: updated.length, updated });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
} 