import { NextResponse } from "next/server";
import postgres from "postgres";
import { revalidatePath } from "next/cache";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET() {
  try {
    const sessions = await sql`
      SELECT * FROM sessions
      ORDER BY created_at DESC
    `;
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch session data" },
      { status: 500 }
    );
  }
}

// POST: Submit session reservation
export async function POST(request) {
  const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

  try {
    const body = await request.json();
    console.log("Received form data:", body);

    // Convert camelCase to snake_case for database consistency
    const dbFormData = {
      user_id: body.user_id,
      category: body.category,
      arrival_date: body.arrivalDate || body.arrival_date,
      shift_name: body.shiftName || body.shift_name,
      full_name: body.fullName || body.full_name,
      members: body.members || [],
      payment_id: body.payment_id,
      payment_status: body.payment_status,
      payment_method: body.payment_method,
      amount: body.amount,
    };

    console.log("Formatted data for DB:", dbFormData);

    // Validation after conversion
    if (!dbFormData.user_id) throw new Error("User not logged in");
    if (!dbFormData.category) throw new Error("Category is required");
    if (!dbFormData.arrival_date) throw new Error("Arrival date is required");
    if (!dbFormData.shift_name) throw new Error("Shift name is required");
    if (!dbFormData.full_name) throw new Error("Full name is required");
    if (
      body.groupMember === "group" &&
      (!dbFormData.members || dbFormData.members.length === 0)
    ) {
      throw new Error("At least one group member is required");
    }

    // Fetch shift details first
    const [shift] = await sql`
      SELECT shift_start, shift_end FROM shifts
      WHERE shift_name = ${dbFormData.shift_name}
    `;

    if (!shift) throw new Error("Invalid shift selected");

    // SOLUSI RACE CONDITION: Gunakan sql.begin() untuk transaction
    const result = await sql.begin(async (sql) => {
      // Lock existing reservations untuk mencegah race condition
      const existingReservations = await sql`
        SELECT id
        FROM sessions 
        WHERE arrival_date = ${dbFormData.arrival_date} 
        AND shift_name = ${dbFormData.shift_name}
        AND status != 'canceled'
        FOR UPDATE
      `;

      // Hitung jumlah reservasi yang sudah ada
      const currentCount = existingReservations.length;

      if (currentCount >= 2) {
        throw new Error(
          "Sorry, this shift is already fully booked. Please choose another shift or date."
        );
      }

      // Insert reservation dengan confidence tidak ada race condition
      const insertResult = await sql`
        INSERT INTO sessions (
          user_id,
          category, 
          arrival_date,
          shift_name,
          shift_start,
          shift_end,
          full_name,
          group_member1,
          group_member2,
          group_member3,
          group_member4,
          status,
          payment_id,
          payment_status,
          payment_method,
          amount
        )
        VALUES (
          ${dbFormData.user_id},
          ${dbFormData.category},
          ${dbFormData.arrival_date},
          ${dbFormData.shift_name},
          ${shift.shift_start},
          ${shift.shift_end},
          ${dbFormData.full_name},
          ${dbFormData.members[0] || null},
          ${dbFormData.members[1] || null},
          ${dbFormData.members[2] || null},
          ${dbFormData.members[3] || null},
          ${"not_attended"},
          ${dbFormData.payment_id},
          ${dbFormData.payment_status},
          ${dbFormData.payment_method},
          ${dbFormData.amount}
        )
        RETURNING *
      `;

      return insertResult[0];
    });

    // Revalidate API availability endpoint so slot langsung update
    revalidatePath("/api/sessions/check-availability");

    console.log("Insert result:", result);
    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Reservation submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit reservation",
      },
      { status: 500 }
    );
  }
}
