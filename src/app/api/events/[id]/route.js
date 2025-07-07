import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function DELETE(request, { params }) {
  try {
    const id = await params.id;
    await sql`DELETE FROM events WHERE id = ${id}`;
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
        event_poster = ${body.event_poster}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(updatedEvent);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update event" },
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
