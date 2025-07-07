import { NextResponse } from "next/server";
import postgres from "postgres";
import { revalidatePath } from "next/cache";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

// Get category by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const category = await sql`
      SELECT * FROM categories
      WHERE id = ${id}
    `;

    if (category.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category[0],
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Update category by ID
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { category_name } = body;

    if (!category_name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await sql`
      SELECT * FROM categories
      WHERE id = ${id}
    `;

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check for duplicate name (excluding current category)
    const duplicateCheck = await sql`
      SELECT * FROM categories
      WHERE LOWER(category_name) = LOWER(${category_name})
      AND id != ${id}
    `;

    if (duplicateCheck.length > 0) {
      return NextResponse.json(
        { success: false, error: "Category name already exists" },
        { status: 400 }
      );
    }

    // Update category
    const updatedCategory = await sql`
      UPDATE categories
      SET 
        category_name = ${category_name}
      WHERE id = ${id}
      RETURNING *
    `;

    revalidatePath("/staff/dashboard/inventory/categorization-inventory");
    return NextResponse.json({
      success: true,
      data: updatedCategory[0],
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Delete category by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if category exists and has no items
    const category = await sql`
      SELECT * FROM categories
      WHERE id = ${id}
    `;

    if (category.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    if (category[0].number_of_items > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete category with existing items" },
        { status: 400 }
      );
    }

    // Delete category
    await sql`
      DELETE FROM categories
      WHERE id = ${id}
    `;

    revalidatePath("/staff/dashboard/inventory/categorization-inventory");
    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}
