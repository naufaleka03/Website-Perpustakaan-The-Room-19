import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET() {
  try {
    const logs = await sql`
      SELECT l.*, i.item_image, c.category_name
      FROM inventory_logs l
      LEFT JOIN inventory i ON l.inventory_id = i.id
      LEFT JOIN categories c ON l.category_id = c.id
      ORDER BY l.created_at DESC
    `;
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching inventory logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inventory logs" },
      { status: 500 }
    );
  }
}
