import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

// Tandai fungsi sebagai async dan gunakan `await` untuk mengakses `params`
export async function PUT(request, context) {
  const { id } = await context.params;

  try {
    const { status } = await request.json();

    // Update status peminjaman di database
    const result = await sql`
      UPDATE loans
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length > 0) {
      return NextResponse.json({ success: true, loan: result[0] }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating loan status:', error);
    return NextResponse.json({ error: 'Failed to update loan status' }, { status: 500 });
  }
}
