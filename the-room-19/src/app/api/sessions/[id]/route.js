import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const [session] = await sql`
      SELECT * FROM sessions
      WHERE id = ${id}
    `;

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error in GET session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Cek apakah request untuk update status atau cancel
    if (request.url.includes('/cancel')) {
      // Logic untuk cancel session
      const [updatedSession] = await sql`
        UPDATE sessions 
        SET status = 'canceled'
        WHERE id = ${id}
        RETURNING *
      `;

      return NextResponse.json(updatedSession);
    } else if (body.status) {
      // Logic untuk update status
      const [updatedSession] = await sql`
        UPDATE sessions 
        SET status = ${body.status}
        WHERE id = ${id}
        RETURNING *
      `;

      return NextResponse.json(updatedSession);
    }

    return NextResponse.json({ error: 'Invalid update operation' }, { status: 400 });
  } catch (error) {
    console.error('Error in PUT session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}