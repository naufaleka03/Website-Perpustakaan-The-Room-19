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
        e.additional_notes,
        e.is_deleted AS event_is_deleted
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
    const body = await request.json();
    console.log("Received form data:", body);

    // Convert camelCase to snake_case for database consistency
    const dbFormData = {
      user_id: body.user_id,
      event_name: body.event_name,
      description: body.description,
      event_date: body.event_date,
      shift_name: body.shift_name,
      shift_start: body.shift_start,
      shift_end: body.shift_end,
      max_participants: body.max_participants,
      ticket_fee: body.ticket_fee,
      additional_notes: body.additional_notes,
      full_name: body.full_name,
      members: body.members || [],
      status: "not_attended",
      payment_id: body.payment_id,
      payment_status: body.payment_status,
      payment_method: body.payment_method,
    };

    // Validation
    if (!dbFormData.user_id) throw new Error("User not logged in");
    if (!dbFormData.event_name) throw new Error("Event name is required");
    if (!dbFormData.event_date) throw new Error("Event date is required");
    if (!dbFormData.shift_name) throw new Error("Shift name is required");
    if (!dbFormData.full_name) throw new Error("Full name is required");

    // Insert reservation into database
    const result = await sql`
      INSERT INTO eventreservations (
        user_id,
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
        payment_method,
        created_at
      )
      VALUES (
        ${dbFormData.user_id},
        ${dbFormData.event_name},
        ${dbFormData.description},
        ${dbFormData.event_date},
        ${dbFormData.shift_name},
        ${dbFormData.shift_start},
        ${dbFormData.shift_end},
        ${dbFormData.max_participants},
        ${dbFormData.ticket_fee},
        ${dbFormData.additional_notes},
        ${dbFormData.full_name},
        ${dbFormData.members[0] || null},
        ${dbFormData.members[1] || null},
        ${dbFormData.members[2] || null},
        ${dbFormData.members[3] || null},
        ${dbFormData.status},
        ${dbFormData.payment_id},
        ${dbFormData.payment_status},
        ${dbFormData.payment_method},
        NOW()
      )
      RETURNING *
    `;

    console.log("Event reservation created:", result);

    return NextResponse.json(
      {
        success: true,
        data: result[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Event reservation submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit event reservation",
      },
      { status: 500 }
    );
  }
}
