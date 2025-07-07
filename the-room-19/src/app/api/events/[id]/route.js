import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function DELETE(request, { params }) {
  try {
    const id = await params.id;
    await sql`
      UPDATE events 
      SET is_deleted = true, deleted_at = NOW() 
      WHERE id = ${id}
    `;
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const id = await params.id;
    const [event] = await sql`
      SELECT * FROM events WHERE id = ${id}
    `;
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const id = await params.id;
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

    // Update event di database
    const [updatedEvent] = await sql`
      UPDATE events
      SET 
        event_name = ${dbFormData.event_name},
        description = ${dbFormData.description},
        event_date = ${dbFormData.event_date}::date,
        shift_name = ${dbFormData.shift_name},
        shift_start = ${shift.shift_start},
        shift_end = ${shift.shift_end},
        max_participants = ${dbFormData.max_participants},
        ticket_fee = ${dbFormData.ticket_fee},
        additional_notes = ${dbFormData.additional_notes},
        event_poster = ${dbFormData.event_poster}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUTStatus(request, { params }) {
  try {
    const { id } = params;
    const formData = await request.formData();
    const status = formData.get("status");

    await sql`
      UPDATE event_reservations
      SET status = ${status}
      WHERE id = ${id}
    `;

    return Response.json({ message: "Event status updated successfully" });
  } catch (error) {
    console.error("Error updating event status:", error);
    return Response.json(
      { error: "Failed to update event status" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const id = params.id;
    const { status } = await request.json();

    // Validate status
    if (!["open", "closed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value. Must be 'open' or 'closed'" },
        { status: 400 }
      );
    }

    const [updatedEvent] = await sql`
      UPDATE events
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: `Event status updated to ${status} successfully`,
    });
  } catch (error) {
    console.error("Error updating event status:", error);
    return NextResponse.json(
      { error: "Failed to update event status" },
      { status: 500 }
    );
  }
}
