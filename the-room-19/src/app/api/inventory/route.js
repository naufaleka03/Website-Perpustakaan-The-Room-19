import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET() {
  try {
    const inventory = await sql`
      SELECT i.*, c.category_name
      FROM inventory i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.is_retired = false
      ORDER BY i.created_at DESC
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
    const {
      item_name,
      description,
      price,
      stock_quantity,
      item_image,
      category_id,
    } = await request.json();

    if (!category_id) {
      return NextResponse.json(
        { success: false, error: "Category is required" },
        { status: 400 }
      );
    }

    // Begin transaction
    const result = await sql.begin(async (sql) => {
      // Insert the item
      const [newItem] = await sql`
        INSERT INTO inventory (
          item_name,
          description,
          price,
          stock_quantity,
          item_image,
          category_id
        ) VALUES (
          ${item_name},
          ${description},
          ${price},
          ${stock_quantity},
          ${item_image},
          ${category_id}
        )
        RETURNING *
      `;

      // Update the category's number_of_items
      await sql`
        UPDATE categories
        SET number_of_items = number_of_items + 1
        WHERE id = ${category_id}
      `;

      return newItem;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}
