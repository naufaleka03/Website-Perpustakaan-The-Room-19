import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

// Tandai fungsi sebagai async dan gunakan `await` untuk mengakses `params`
export async function PUT(request, context) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    let result;
    if (body.loan_due) {
      // Update loan_due, status ke 'On Going', dan increment extend_count
      result = await sql`
        UPDATE loans
        SET loan_due = ${body.loan_due}, status = 'On Going', extend_count = extend_count + 1
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (body.status) {
      // Ambil data loan sebelum update untuk dapatkan book_id1
      const loanBefore = await sql`
        SELECT book_id1, status FROM loans WHERE id = ${id}
      `;
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
      return NextResponse.json({ error: 'No valid field to update' }, { status: 400 });
    }

    if (result.length > 0) {
      return NextResponse.json({ success: true, loan: result[0] }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json({ error: 'Failed to update loan' }, { status: 500 });
  }
}
