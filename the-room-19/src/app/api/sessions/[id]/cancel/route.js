import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    await sql`
      UPDATE sessions 
      SET status = 'canceled'
      WHERE id = ${id}
    `;

    return NextResponse.json({ message: 'Booking canceled successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
} 