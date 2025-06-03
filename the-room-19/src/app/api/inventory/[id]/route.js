"use server";

import postgres from "postgres";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

// Get specific item
export async function GET(request, { params }) {
  try {
    const item = await sql`
      SELECT * FROM inventory
      WHERE id = ${params.id}
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
    const { item_name, description, price, item_image } = await request.json();

    const result = await sql`
      UPDATE inventory
      SET 
        item_name = ${item_name},
        description = ${description},
        price = ${price},
        item_image = ${item_image}
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    revalidatePath("/staff/dashboard/inventory/inventory-list");
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
    const result = await sql`
      DELETE FROM inventory
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    revalidatePath("/staff/dashboard/inventory/inventory-list");
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

// Update stock quantity
export async function PATCH(request, { params }) {
  try {
    const { stock_quantity } = await request.json();

    const result = await sql`
      UPDATE inventory
      SET stock_quantity = ${stock_quantity}
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    revalidatePath("/staff/dashboard/inventory/inventory-list");
    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update stock quantity" },
      { status: 500 }
    );
  }
}
