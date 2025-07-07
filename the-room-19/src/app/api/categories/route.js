import { NextResponse } from "next/server";
import postgres from "postgres";
import { revalidatePath } from "next/cache";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET() {
  try {
    const categories = await sql`
      SELECT 
        c.id,
        c.category_name,
        COUNT(i.id) as number_of_items
      FROM categories c
      LEFT JOIN inventory i ON c.id = i.category_id
      GROUP BY c.id, c.category_name
      ORDER BY c.category_name ASC
    `;

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

// POST: Create new category
export async function POST(request) {
  try {
    const body = await request.json();
    const { category_name } = body;

    if (!category_name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await sql`
      SELECT * FROM categories 
      WHERE LOWER(category_name) = LOWER(${category_name})
    `;

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { success: false, error: "Category already exists" },
        { status: 400 }
      );
    }

    // Insert new category
    const result = await sql`
      INSERT INTO categories (
        category_name,
        number_of_items
      ) VALUES (
        ${category_name},
        0
      )
      RETURNING *
    `;

    revalidatePath("/staff/dashboard/inventory/categorization-inventory");
    return NextResponse.json(
      { success: true, data: result[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
