import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function POST(request) {
  try {
    const data = await request.json();
    const { event_id, reservation_type, group_size = 1 } = data;

    // Get event details and current reservations
    const [event] = await sql`
      SELECT 
        e.*,
        COALESCE(
          (
            SELECT SUM(
              CASE 
                WHEN er.group_member1 IS NOT NULL THEN 
                  1 + (CASE WHEN er.group_member2 IS NOT NULL THEN 1 ELSE 0 END) +
                  (CASE WHEN er.group_member3 IS NOT NULL THEN 1 ELSE 0 END) +
                  (CASE WHEN er.group_member4 IS NOT NULL THEN 1 ELSE 0 END)
                ELSE 1
              END
            )
            FROM eventreservations er
            WHERE er.event_name = e.event_name
            AND er.event_date = e.event_date
            AND er.shift_name = e.shift_name
            AND er.status != 'canceled'
          ),
          0
        ) as current_participants
      FROM events e
      WHERE e.id = ${event_id}
    `;

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const availableSlots = event.max_participants - event.current_participants;
    const requestedSlots = reservation_type === "group" ? group_size : 1;
    const isAvailable = availableSlots >= requestedSlots;

    return NextResponse.json({
      available: isAvailable,
      current_participants: event.current_participants,
      available_slots: availableSlots,
      max_participants: event.max_participants,
      message: isAvailable
        ? `Available ${availableSlots} slots out of a total of ${event.max_participants} slots`
        : `Sorry, only ${availableSlots} slots remaining out of a total of ${event.max_participants} slots`,
    });
  } catch (error) {
    console.error("Error checking event availability:", error);
    return NextResponse.json(
      { error: "Failed to check event availability" },
      { status: 500 }
    );
  }
}
