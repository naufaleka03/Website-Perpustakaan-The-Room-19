import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

// Tandai fungsi sebagai async dan gunakan `await` untuk mengakses `params`
export async function PUT(request, context) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    console.log('PUT /api/loans/[id] - Request body:', body);
    console.log('PUT /api/loans/[id] - Loan ID:', id);
    
    let result;
    
    // Cek apakah loan dengan ID tersebut ada
    const existingLoan = await sql`
      SELECT id, loan_due, status, extend_count FROM loans WHERE id = ${id}
    `;
    
    if (existingLoan.length === 0) {
      console.error('PUT /api/loans/[id] - Loan not found:', id);
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }
    
    console.log('PUT /api/loans/[id] - Existing loan:', existingLoan[0]);
    
    if (typeof body.fine !== 'undefined' && body.fine === false && body.payFine === true) {
      // Pembayaran denda: update fine, status, dan loan_due ke hari ini (WIB)
      const now = new Date();
      const wibOffset = 7 * 60;
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const wibNow = new Date(utc + (wibOffset * 60000));
      const todayWIB = wibNow.toISOString().split('T')[0];
      
      console.log('PUT /api/loans/[id] - Paying fine, new loan_due:', todayWIB);
      
      result = await sql`
        UPDATE loans
        SET fine = false, status = 'Due Date', loan_due = ${todayWIB}
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (typeof body.fine !== 'undefined') {
      // Update kolom fine (boolean)
      console.log('PUT /api/loans/[id] - Updating fine to:', body.fine);
      
      result = await sql`
        UPDATE loans
        SET fine = ${body.fine}
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (body.loan_due) {
      // Update loan_due, status ke 'On Going', dan increment extend_count
      console.log('PUT /api/loans/[id] - Extending loan, new loan_due:', body.loan_due);
      console.log('PUT /api/loans/[id] - Current extend_count:', existingLoan[0].extend_count);
      
      // Validasi format tanggal
      if (!/^\d{4}-\d{2}-\d{2}$/.test(body.loan_due)) {
        console.error('PUT /api/loans/[id] - Invalid date format:', body.loan_due);
        return NextResponse.json({ error: 'Invalid date format. Expected YYYY-MM-DD' }, { status: 400 });
      }
      
      result = await sql`
        UPDATE loans
        SET loan_due = ${body.loan_due}, status = 'On Going', extend_count = extend_count + 1
        WHERE id = ${id}
        RETURNING *
      `;
      
      console.log('PUT /api/loans/[id] - Extend result:', result);
    } else if (body.status) {
      // Ambil data loan sebelum update untuk dapatkan book_id1
      const loanBefore = await sql`
        SELECT book_id1, status FROM loans WHERE id = ${id}
      `;
      
      console.log('PUT /api/loans/[id] - Updating status to:', body.status);
      
      // Update status saja
      result = await sql`
        UPDATE loans
        SET status = ${body.status}
        WHERE id = ${id}
        RETURNING *
      `;
      
      // Jika status berubah menjadi Returned dan sebelumnya bukan Returned, tambahkan stok buku
      if (body.status === 'Returned' && loanBefore[0] && loanBefore[0].status !== 'Returned') {
        await sql`
          UPDATE books SET stock = stock + 1 WHERE id = ${loanBefore[0].book_id1}
        `;
      }
    } else {
      console.error('PUT /api/loans/[id] - No valid field to update');
      return NextResponse.json({ error: 'No valid field to update' }, { status: 400 });
    }

    if (result && result.length > 0) {
      console.log('PUT /api/loans/[id] - Update successful:', result[0]);
      return NextResponse.json({ success: true, loan: result[0] }, { status: 200 });
    } else {
      console.error('PUT /api/loans/[id] - Update failed, no rows affected');
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('PUT /api/loans/[id] - Error updating loan:', error);
    return NextResponse.json({ error: 'Failed to update loan', details: error.message }, { status: 500 });
  }
}
