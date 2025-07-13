import postgres from "postgres";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

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
    let { status } = body;

    // Normalize status value
    if (status === "not attended") status = "not_attended";

    // Validate the status
    if (!status || !["canceled", "attended", "not_attended"].includes(status)) {
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

// PATCH: Update session status (migrated from actions.js)
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    let { status, cancellationReason } = body;

    // Normalize status value
    if (status === "not attended") status = "not_attended";

    // Validate status
    if (!status || !["canceled", "attended", "not_attended"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      );
    }

    // Get current session data to calculate slots to return if canceling
    const currentSession = await sql`
      SELECT * FROM sessions WHERE id = ${id}
    `;

    if (!currentSession || currentSession.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Update the session status
    const updatedSession = await sql`
      UPDATE sessions 
      SET 
        status = ${status},
        cancellation_reason = CASE 
          WHEN ${status} = 'canceled' THEN ${cancellationReason ?? ""}
          ELSE cancellation_reason
        END
      WHERE id = ${id}
      RETURNING *
    `;

    // If canceling, calculate and log returned slots
    if (status === "canceled") {
      const slotsToReturn =
        1 + // Main person
        (currentSession[0].group_member1 ? 1 : 0) +
        (currentSession[0].group_member2 ? 1 : 0) +
        (currentSession[0].group_member3 ? 1 : 0) +
        (currentSession[0].group_member4 ? 1 : 0);

      console.log(`Returning ${slotsToReturn} slots to availability`);
    }

    // Revalidate the sessions page to show updated data
    revalidatePath("/staff/dashboard/data-collection");

    return NextResponse.json({
      success: true,
      data: updatedSession[0],
      message: `Session status updated to ${status} successfully`,
    });
  } catch (error) {
    console.error("Error updating session status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update session status" },
      { status: 500 }
    );
  }
}
