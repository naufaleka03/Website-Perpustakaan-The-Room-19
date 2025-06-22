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
    const sessions = await sql`
      SELECT
        id,
        arrival_date,
        full_name,
        shift_name,
        payment_id,
        amount,
        payment_status,
        status,
        shift_start,
        shift_end,
        created_at,
        category,
        ARRAY_REMOVE(ARRAY[group_member1, group_member2, group_member3, group_member4], NULL) as group_members
      FROM sessions
      WHERE user_id = ${user.id}
      ORDER BY arrival_date DESC
    `;

    return NextResponse.json(sessions);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
