import { createClient } from "@/app/supabase/server";
import { cookies } from "next/headers";
import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET(request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const eventReservations = await sql`
      SELECT
        id,
        event_name,
        event_date,
        shift_name,
        shift_start,
        shift_end,
        full_name,
        ticket_fee,
        payment_id,
        payment_status,
        status,
        description,
        additional_notes,
        created_at,
        ARRAY_REMOVE(ARRAY[group_member1, group_member2, group_member3, group_member4], NULL) as group_members
      FROM eventreservations
      WHERE user_id = ${user.id}
      ORDER BY event_date DESC
    `;

    return NextResponse.json(eventReservations);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
