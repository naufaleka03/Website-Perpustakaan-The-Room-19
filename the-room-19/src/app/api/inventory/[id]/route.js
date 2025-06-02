import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

// Get specific item
export async function GET(request, { params }) {
  try {
    const id = await params.id;
    const item = await sql`
      SELECT * FROM inventory
      WHERE id = ${id}
    `;

    if (item.length === 0) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item[0] });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

// Update item
export async function PUT(request, { params }) {
  try {
    const id = await params.id;
    const { item_name, description, price, stock_quantity, item_image } =
      await request.json();

    const result = await sql`
      UPDATE inventory
      SET 
        item_name = ${item_name},
        description = ${description},
        price = ${price},
        stock_quantity = ${stock_quantity},
        item_image = ${item_image}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// Delete item
export async function DELETE(request, { params }) {
  try {
    const id = await params.id;

    const result = await sql`
      DELETE FROM inventory
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
