import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET() {
  try {
    const eventReservations = await sql`
      SELECT
        er.*,
        e.event_name,
        e.description,
        e.event_date,
        e.shift_name,
        e.shift_start,
        e.shift_end,
        e.max_participants,
        e.ticket_fee,
        e.additional_notes
      FROM eventreservations er
      LEFT JOIN events e ON 
        er.event_name = e.event_name AND
        er.event_date = e.event_date AND
        er.shift_name = e.shift_name
      ORDER BY er.created_at DESC
    `;
    return NextResponse.json(eventReservations);
  } catch (error) {
    console.error("Error fetching event reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch event reservations" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const result = await sql`
      INSERT INTO eventreservations (
        event_name,
        description,
        event_date,
        shift_name,
        shift_start,
        shift_end,
        max_participants,
        ticket_fee,
        additional_notes,
        full_name,
        group_member1,
        group_member2,
        group_member3,
        group_member4,
        status,
        payment_id,
        payment_status,
        payment_method
      ) VALUES (
        ${data.event_name},
        ${data.description},
        ${data.event_date},
        ${data.shift_name},
        ${data.shift_start},
        ${data.shift_end},
        ${data.max_participants},
        ${data.ticket_fee},
        ${data.additional_notes},
        ${data.full_name},
        ${data.members?.[0] || null},
        ${data.members?.[1] || null},
        ${data.members?.[2] || null},
        ${data.members?.[3] || null},
        ${data.status || "not_attended"},
        ${data.payment_id || null},
        ${data.payment_status || null},
        ${data.payment_method || null}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error creating event reservation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create event reservation",
      },
      { status: 500 }
    );
  }
}
