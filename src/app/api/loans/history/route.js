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
    const loans = await sql`
      SELECT
        id,
        user_id,
        book_id1,
        book_id2,
        book_title1,
        book_title2,
        genre1,
        genre2,
        cover_image1,
        cover_image2,
        price1,
        price2,
        full_name,
        email,
        phone_number,
        loan_start,
        loan_due,
        status,
        extend_count,
        fine,
        fine_amount,
        copies,
        copies_id,
        created_at
      FROM loans
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(loans);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 