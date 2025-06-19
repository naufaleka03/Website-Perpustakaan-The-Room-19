import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET() {
  try {
    const logs = await sql`
      SELECT l.*, i.item_image, c.category_name, s.name AS staff_name
      FROM inventory_logs l
      LEFT JOIN inventory i ON l.inventory_id = i.id
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN staffs s ON l.handle_by = s.id
      WHERE l.handle_by IS NOT NULL
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

export async function POST(request) {
  try {
    const {
      inventory_id,
      mode,
      item_name,
      category_id,
      stock_before,
      stock_after,
      comment,
      handle_by, // ID staff yang melakukan aksi
    } = await request.json();

    if (
      !inventory_id ||
      !mode ||
      !item_name ||
      !category_id ||
      handle_by == null
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newLog] = await sql`
      INSERT INTO inventory_logs (
        inventory_id,
        mode,
        item_name,
        category_id,
        stock_before,
        stock_after,
        comment,
        handle_by
      ) VALUES (
        ${inventory_id},
        ${mode},
        ${item_name},
        ${category_id},
        ${stock_before},
        ${stock_after},
        ${comment},
        ${handle_by}
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: newLog });
  } catch (error) {
    console.error("Error creating inventory log:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create inventory log" },
      { status: 500 }
    );
  }
}
