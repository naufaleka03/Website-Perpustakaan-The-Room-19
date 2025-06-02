import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET() {
  try {
    const inventory = await sql`
      SELECT * FROM inventory
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, data: inventory });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inventory items" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { item_name, description, price, stock_quantity, item_image } =
      await request.json();

    const result = await sql`
      INSERT INTO inventory (
        item_name,
        description,
        price,
        stock_quantity,
        item_image
      ) VALUES (
        ${item_name},
        ${description},
        ${price},
        ${stock_quantity},
        ${item_image}
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}
