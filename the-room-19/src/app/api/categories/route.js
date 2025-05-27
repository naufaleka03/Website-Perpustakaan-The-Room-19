import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET() {
  try {
    const categories = await sql`
      SELECT * FROM categories
      ORDER BY category_name ASC
    `;

    return Response.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json(
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
