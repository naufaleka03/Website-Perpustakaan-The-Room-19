import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function GET() {
  try {
    const applications = await sql`
      SELECT 
        ma.id, ma.full_name, ma.email, ma.phone_number, ma.status, 
        ma.created_at, ma.updated_at
      FROM memberships ma
      ORDER BY ma.created_at DESC
    `;
    return Response.json(applications);
  } catch (error) {
    console.error('Error fetching membership applications:', error);
    return Response.json({ error: 'Failed to fetch membership applications' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['user_id', 'full_name', 'email', 'phone_number', 'address', 
      'emergency_contact_name', 'emergency_contact_number', 'id_card_url'];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return Response.json({ error: `${field} is required` }, { status: 400 });
      }
    }
    
    // Check if user already has a pending application
    const [existing] = await sql`
      SELECT id FROM memberships 
      WHERE user_id = ${body.user_id} AND status IN ('request', 'processing')
    `;
    
    if (existing) {
      return Response.json(
        { error: 'You already have a pending membership application' }, 
        { status: 409 }
      );
    }
    
    // Insert new application
    const [newApplication] = await sql`
      INSERT INTO memberships (
        user_id, full_name, email, phone_number, address,
        favorite_book_genre, emergency_contact_name, emergency_contact_number,
        id_card_url, status
      ) VALUES (
        ${body.user_id}, ${body.full_name}, ${body.email}, ${body.phone_number}, ${body.address},
        ${body.favorite_book_genre || null}, ${body.emergency_contact_name}, ${body.emergency_contact_number},
        ${body.id_card_url}, 'request'
      )
      RETURNING id, status, created_at
    `;
    
    return Response.json({
      success: true,
      data: newApplication,
      message: 'Membership application submitted successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating membership application:', error);
    return Response.json(
      { error: 'Failed to submit membership application' }, 
      { status: 500 }
    );
  }
} 