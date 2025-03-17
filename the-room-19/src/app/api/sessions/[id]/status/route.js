import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function PUT(request, { params }) {
  try {
    const { id } = await params; 
    const { status } = await request.json();

    await sql`
      UPDATE sessions 
      SET status = ${status}
      WHERE id = ${id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating status:', error);
    return Response.json({ error: 'Failed to update status' }, { status: 500 });
  }
}