import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await sql`DELETE FROM events WHERE id = ${id}`;
    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const [event] = await sql`
      SELECT * FROM events WHERE id = ${id}
    `;
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    const [updatedEvent] = await sql`
      UPDATE events
      SET 
        event_name = ${body.event_name},
        description = ${body.description},
        event_date = ${body.event_date},
        shift_name = ${body.shift_name},
        max_participants = ${body.max_participants},
        ticket_fee = ${body.ticket_fee},
        additional_notes = ${body.additional_notes},
        activity_poster = ${body.activity_poster}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(updatedEvent);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
} 