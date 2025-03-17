import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function GET(request, { params }) {
  try {
    // Await params untuk mendapatkan nilai id
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

    return NextResponse.json({
      id,
      status: 'success',
      ...session,
    });
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
    // Await params untuk mendapatkan nilai id
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const body = await request.json();

    // Proses update status
    await sql`UPDATE sessions SET ... WHERE id = ${id}`;

    return NextResponse.json({
      message: 'Status updated successfully',
      id,
      ...body,
    });
  } catch (error) {
    console.error('Error in PUT session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}