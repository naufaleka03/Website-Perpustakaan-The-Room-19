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

    // Cek stok buku sebelum membuat loan
    const bookStockResult = await sql`
      SELECT stock FROM books WHERE id = ${requestData.book_id1}
    `;
    if (!bookStockResult[0] || bookStockResult[0].stock < 1) {
      return Response.json(
        { error: 'Stok buku tidak tersedia, tidak dapat melakukan peminjaman.' },
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
      status: 'On Going',
      extend_count: 0,
      fine: 0
    };

    try {
      // Insert ke tabel loans
      const insertedLoan = await sql`
        INSERT INTO loans ${sql(newLoan, 
          'user_id', 'book_id1', 'book_id2', 'book_title1', 'book_title2', 
          'genre1', 'genre2', 'cover_image1', 'cover_image2', 'price1', 'price2',
          'full_name', 'email', 'phone_number', 'loan_start', 'loan_due', 'status', 'extend_count'
        )}
        RETURNING *
      `;
      let transactionRow = null;
      if (insertedLoan && insertedLoan.length > 0 && (requestData.payment_id || requestData.payment_status || requestData.payment_method)) {
        // Insert ke tabel transaction jika ada data payment
        const amount = (requestData.price1 ? Number(requestData.price1) : 0) + (requestData.price2 ? Number(requestData.price2) : 0);
        const transactionData = {
          loan_id: insertedLoan[0].id,
          payment_id: requestData.payment_id || null,
          payment_status: requestData.payment_status || null,
          payment_method: requestData.payment_method || null,
          amount: amount
        };
        const insertedTransaction = await sql`
          INSERT INTO transaction ${sql(transactionData, 'loan_id', 'payment_id', 'payment_status', 'payment_method', 'amount')}
          RETURNING *
        `;
        transactionRow = insertedTransaction && insertedTransaction.length > 0 ? insertedTransaction[0] : null;
      }
      if (insertedLoan && insertedLoan.length > 0) {
        // Kurangi stok buku setelah peminjaman berhasil
        await sql`
          UPDATE books SET stock = stock - 1 WHERE id = ${requestData.book_id1}
        `;
        // Tambah total_borrow setiap kali buku dipinjam
        await sql`
          UPDATE books SET total_borrow = total_borrow + 1 WHERE id = ${requestData.book_id1}
        `;
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

// PATCH handler untuk update status Over Due dan fine
export async function PATCH(request) {
  try {
    // Hitung tanggal hari ini (WIB)
    const now = new Date();
    const wibOffset = 7 * 60; // WIB = UTC+7 dalam menit
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wibNow = new Date(utc + (wibOffset * 60000));
    const todayWIB = wibNow.toISOString().split('T')[0];

    // Ambil semua loan yang overdue dan belum dikembalikan
    const overdueLoans = await sql`
      SELECT id, loan_due, status
      FROM loans
      WHERE status != 'Returned' AND loan_due < ${todayWIB}
    `;

    for (const loan of overdueLoans) {
      // Hitung selisih hari keterlambatan
      const dueDate = new Date(loan.loan_due + 'T00:00:00+07:00');
      const daysOverdue = Math.ceil((wibNow.setHours(0,0,0,0) - dueDate.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
      const isOverdue = daysOverdue > 0;
      await sql`
        UPDATE loans SET fine = ${isOverdue}, fine_amount = ${isOverdue ? daysOverdue * 5000 : 0}, status = 'Over Due' WHERE id = ${loan.id}
      `;
    }

    // Update loan yang sudah tidak overdue/fine harus false
    const notOverdue = await sql`
      SELECT id, loan_due, status FROM loans WHERE status != 'Returned' AND loan_due >= ${todayWIB}
    `;
    for (const loan of notOverdue) {
      await sql`
        UPDATE loans SET fine = false WHERE id = ${loan.id}
      `;
    }

    return Response.json({ success: true, updated_count: overdueLoans.length });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
} 