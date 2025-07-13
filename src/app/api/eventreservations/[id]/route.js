import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET(request, { params }) {
  try {
    const id = params.id;
    const [eventReservation] = await sql`
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
        er.cancellation_reason
      FROM eventreservations er
      LEFT JOIN events e ON 
        er.event_name = e.event_name AND
        er.event_date = e.event_date AND
        er.shift_name = e.shift_name
      WHERE er.id = ${id}
    `;

    if (!eventReservation) {
      return NextResponse.json(
        { error: "Event reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(eventReservation);
  } catch (error) {
    console.error("Error fetching event reservation:", error);
    return NextResponse.json(
      { error: "Failed to fetch event reservation" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const formData = await request.formData();
    const status = formData.get("status");
    const cancellationReason = formData.get("cancellationReason");

    // Validate status
    if (!["not_attended", "attended", "canceled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // If canceling, get current reservation data to calculate slots to return
    if (status === "canceled") {
      const [currentReservation] = await sql`
        SELECT 
          er.*,
          e.max_participants,
          e.event_name,
          e.event_date
        FROM eventreservations er
        LEFT JOIN events e ON 
          er.event_name = e.event_name AND
          er.event_date = e.event_date AND
          er.shift_name = e.shift_name
        WHERE er.id = ${id}
      `;

      if (!currentReservation) {
        return NextResponse.json(
          { error: "Event reservation not found" },
          { status: 404 }
        );
      }

      // Calculate slots to return
      const slotsToReturn =
        1 + // Main person
        (currentReservation.group_member1 ? 1 : 0) +
        (currentReservation.group_member2 ? 1 : 0) +
        (currentReservation.group_member3 ? 1 : 0) +
        (currentReservation.group_member4 ? 1 : 0);

      console.log(`Returning ${slotsToReturn} slots to availability`);
    }

    // Update the reservation status
    const [updatedReservation] = await sql`
      UPDATE eventreservations
      SET 
        status = ${status},
        cancellation_reason = CASE 
          WHEN ${status} = 'canceled' THEN ${cancellationReason ?? ""}
          ELSE cancellation_reason
        END
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updatedReservation) {
      return NextResponse.json(
        { error: "Event reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedReservation,
      message:
        status === "canceled"
          ? "Event reservation canceled successfully. Slots have been returned to availability."
          : "Event reservation status updated successfully",
    });
  } catch (error) {
    console.error("Error updating event reservation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update event reservation status",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const id = params.id;
    const { status, cancellationReason } = await request.json();

    // Validate status
    if (!["not_attended", "attended", "canceled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // If canceling, get current reservation data to calculate slots to return
    if (status === "canceled") {
      const [currentReservation] = await sql`
        SELECT 
          er.*,
          e.max_participants,
          e.event_name,
          e.event_date
        FROM eventreservations er
        LEFT JOIN events e ON 
          er.event_name = e.event_name AND
          er.event_date = e.event_date AND
          er.shift_name = e.shift_name
        WHERE er.id = ${id}
      `;

      if (!currentReservation) {
        return NextResponse.json(
          { error: "Event reservation not found" },
          { status: 404 }
        );
      }

      // Calculate slots to return
      const slotsToReturn =
        1 +
        (currentReservation.group_member1 ? 1 : 0) +
        (currentReservation.group_member2 ? 1 : 0) +
        (currentReservation.group_member3 ? 1 : 0) +
        (currentReservation.group_member4 ? 1 : 0);

      console.log(`Returning ${slotsToReturn} slots to availability`);
    }

    // Update the reservation status
    const [updatedReservation] = await sql`
      UPDATE eventreservations
      SET 
        status = ${status},
        cancellation_reason = CASE 
          WHEN ${status} = 'canceled' THEN ${cancellationReason}
          ELSE cancellation_reason
        END
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updatedReservation) {
      return NextResponse.json(
        { error: "Event reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedReservation,
      message:
        status === "canceled"
          ? "Event reservation canceled successfully. Slots have been returned to availability."
          : "Event reservation status updated successfully",
    });
  } catch (error) {
    console.error("Error updating event reservation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update event reservation status",
      },
      { status: 500 }
    );
  }
}
