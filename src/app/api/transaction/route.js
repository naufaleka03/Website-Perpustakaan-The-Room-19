import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function POST(request) {
  try {
    const { loan_id, payment_id, payment_status, payment_method } = await request.json();
    if (!loan_id || !payment_id || !payment_status || !payment_method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const inserted = await sql`
      INSERT INTO transaction (loan_id, payment_id, payment_status, payment_method)
      VALUES (${loan_id}, ${payment_id}, ${payment_status}, ${payment_method})
      RETURNING *
    `;
    if (inserted && inserted.length > 0) {
      return NextResponse.json({ success: true, transaction: inserted[0] }, { status: 201 });
    } else {
      throw new Error('Failed to insert transaction');
    }
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to insert transaction' }, { status: 500 });
  }
} 