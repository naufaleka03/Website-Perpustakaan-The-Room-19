"use server";

import postgres from "postgres";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

// Get specific item
export async function GET(request, { params }) {
  try {
    const item = await sql`
      SELECT i.*, c.category_name
      FROM inventory i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ${params.id}
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
    const { item_name, description, price, item_image, category_id } =
      await request.json();

    // Get the current item to check if category has changed
    const currentItem = await sql`
      SELECT category_id FROM inventory WHERE id = ${params.id}
    `;

    if (currentItem.length === 0) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    // If category has changed, update the counts
    if (currentItem[0].category_id !== category_id) {
      // Decrease count for old category
      if (currentItem[0].category_id) {
        await sql`
          UPDATE categories
          SET number_of_items = number_of_items - 1
          WHERE id = ${currentItem[0].category_id}
        `;
      }
      // Increase count for new category
      if (category_id) {
        await sql`
          UPDATE categories
          SET number_of_items = number_of_items + 1
          WHERE id = ${category_id}
        `;
      }
    }

    const result = await sql`
      UPDATE inventory
      SET 
        item_name = ${item_name},
        description = ${description},
        price = ${price},
        item_image = ${item_image},
        category_id = ${category_id}
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
    // Get the item's category before deletion
    const item = await sql`
      SELECT category_id FROM inventory WHERE id = ${params.id}
    `;

    if (item.length === 0) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    // Decrease the category's number_of_items if item has a category
    if (item[0].category_id) {
      await sql`
        UPDATE categories
        SET number_of_items = number_of_items - 1
        WHERE id = ${item[0].category_id}
      `;
    }

    const result = await sql`
      DELETE FROM inventory
      WHERE id = ${params.id}
      RETURNING *
    `;

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
    const { stock_quantity, comment } = await request.json();

    const result = await sql`
      UPDATE inventory
      SET stock_quantity = ${stock_quantity},
          comment = ${comment}
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
