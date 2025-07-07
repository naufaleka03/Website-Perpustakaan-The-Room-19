import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function GET() {
  try {
    const sessions = await sql`
      SELECT * FROM sessions
      ORDER BY created_at DESC
    `;
    return Response.json(sessions);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch session data" },
      { status: 500 }
    );
  }
}
