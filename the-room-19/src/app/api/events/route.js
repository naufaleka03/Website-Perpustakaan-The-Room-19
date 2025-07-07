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
      WHERE is_deleted = false
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

// POST: Create new event
export async function POST(request) {
  try {
    const body = await request.json();
    const [month, day, year] = body.event_date.split("-");
    const formattedDate = `${year}-${month}-${day}`;

    // Convert File object to base64 string if exists
    let posterUrl = body.event_poster;
    if (body.event_poster instanceof File) {
      const buffer = await body.event_poster.arrayBuffer();
      const base64String = Buffer.from(buffer).toString("base64");
      posterUrl = `data:${body.event_poster.type};base64,${base64String}`;
    }

    const dbFormData = {
      event_name: body.event_name,
      description: body.description,
      event_date: formattedDate,
      shift_name: body.shift_name,
      max_participants: parseInt(body.max_participants),
      ticket_fee: parseInt(body.ticket_fee),
      additional_notes: body.additional_notes,
      event_poster: posterUrl,
    };

    // Validasi data
    if (!dbFormData.event_name) throw new Error("Title is required");
    if (!dbFormData.event_date) throw new Error("Event date is required");
    if (!dbFormData.shift_name) throw new Error("Shift name is required");
    if (!dbFormData.ticket_fee) throw new Error("Price is required");

    // Fetch shift details
    const [shift] = await sql`
      SELECT shift_start, shift_end FROM shifts
      WHERE shift_name = ${dbFormData.shift_name}
    `;

    if (!shift) throw new Error("Invalid shift selected");

    // Insert ke database dengan shift details
    const [newEvent] = await sql`
      INSERT INTO events (
        event_name,
        description,
        event_date,
        shift_name,
        shift_start,
        shift_end,
        max_participants,
        ticket_fee,
        additional_notes,
        event_poster,
        created_at
      ) VALUES (
        ${dbFormData.event_name},
        ${dbFormData.description},
        ${dbFormData.event_date}::date,
        ${dbFormData.shift_name},
        ${shift.shift_start},
        ${shift.shift_end},
        ${dbFormData.max_participants},
        ${dbFormData.ticket_fee},
        ${dbFormData.additional_notes},
        ${dbFormData.event_poster},
        NOW()
      ) RETURNING *
    `;

    return NextResponse.json(
      { success: true, data: newEvent },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
