import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

const MAX_PEOPLE_PER_SHIFT = 18;

export async function POST(request) {
  try {
    const body = await request.json();
    const { arrival_date, shift_name, reservation_type, group_size = 1 } = body;

    if (!arrival_date || !shift_name) {
      return NextResponse.json(
        { error: "Arrival date and shift name are required" },
        { status: 400 }
      );
    }

    // Get all active reservations for the given date and shift
    const existingReservations = await sql`
      SELECT 
        CASE 
          WHEN group_member1 IS NOT NULL THEN 
            1 + (CASE WHEN group_member2 IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN group_member3 IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN group_member4 IS NOT NULL THEN 1 ELSE 0 END)
          ELSE 1
        END as total_people
      FROM sessions 
      WHERE arrival_date = ${arrival_date}
      AND shift_name = ${shift_name}
      AND status != 'canceled'
    `;

    // Hitung total orang yang sudah terdaftar
    const totalExistingPeople = existingReservations.reduce(
      (sum, res) => sum + res.total_people,
      0
    );

    // Hitung sisa slot yang tersedia
    const availableSlots = MAX_PEOPLE_PER_SHIFT - totalExistingPeople;

    // Cek apakah masih tersedia slot untuk jumlah orang yang akan reservasi
    const requestedSlots = reservation_type === "group" ? group_size : 1;
    const isAvailable = availableSlots >= requestedSlots;

    return NextResponse.json({
      available: isAvailable,
      current_people: totalExistingPeople,
      available_slots: availableSlots,
      max_people: MAX_PEOPLE_PER_SHIFT,
      message: isAvailable
        ? `Available ${availableSlots} slots out of a total of ${MAX_PEOPLE_PER_SHIFT} slots`
        : `Sorry, only ${availableSlots} slots remaining out of a total of ${MAX_PEOPLE_PER_SHIFT} slots`,
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
