import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function GET() {
  try {
    const sessions = await sql`
      SELECT id, full_name, arrival_date, shift_name, category, status, created_at
      FROM sessions
      ORDER BY created_at DESC
    `;
    return Response.json(sessions);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch session data' }, { status: 500 });
  }
} 