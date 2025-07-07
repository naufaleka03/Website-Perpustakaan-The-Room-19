import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET(request, { params }) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const [session] = await sql`
      SELECT * FROM sessions
      WHERE id = ${id}
    `;

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error in GET session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { status } = body;

    // Validate the status
    if (!status || !["canceled", "attended", "not attended"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      );
    }

    // Get the current session data before updating
    const currentSession = await sql`
      SELECT * FROM sessions WHERE id = ${id}
    `;

    if (!currentSession || currentSession.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Update the session status
    const updatedSession = await sql`
        UPDATE sessions 
      SET status = ${status}
        WHERE id = ${id}
        RETURNING *
      `;

    // If the status is being changed to 'canceled', we need to update slot availability
    if (status === "canceled") {
      // Calculate how many slots to return based on group size
      const slotsToReturn =
        1 + // Main person
        (currentSession[0].group_member1 ? 1 : 0) +
        (currentSession[0].group_member2 ? 1 : 0) +
        (currentSession[0].group_member3 ? 1 : 0) +
        (currentSession[0].group_member4 ? 1 : 0);

      console.log(`Returning ${slotsToReturn} slots to availability`);
    }

    return NextResponse.json({
      success: true,
      data: updatedSession[0],
      message: `Session status updated to ${status} successfully`,
    });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
