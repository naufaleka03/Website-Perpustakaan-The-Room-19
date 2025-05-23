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
      // Update loan_due dan status ke 'On Going'
      result = await sql`
        UPDATE loans
        SET loan_due = ${body.loan_due}, status = 'On Going'
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (body.status) {
      // Update status saja
      result = await sql`
        UPDATE loans
        SET status = ${body.status}
        WHERE id = ${id}
        RETURNING *
      `;
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
