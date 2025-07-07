import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET() {
  try {
    const events = await sql`
      SELECT 
        id,
        event_name,
        description,
        event_date,
        shift_name,
        max_participants,
        ticket_fee,
        additional_notes,
        event_poster,
        status,
        created_at
      FROM events
      ORDER BY created_at DESC
    `;
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
