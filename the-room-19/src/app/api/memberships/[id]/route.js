import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // Get single membership with staff details
    const [application] = await sql`
      SELECT 
        m.*,
        s.name as staff_name
      FROM memberships m
      LEFT JOIN staffs s ON m.reviewed_by = s.id
      WHERE m.id = ${id}
    `;

    if (!application) {
      return NextResponse.json({ error: 'Membership application not found' }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error in GET membership application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // If only status/notes/staff_id are present, do a partial update (staff action)
    if (
      typeof body.status !== 'undefined' &&
      (typeof body.notes !== 'undefined' || typeof body.staff_id !== 'undefined') &&
      Object.keys(body).every(key => ['status', 'notes', 'staff_id'].includes(key))
    ) {
      const [updatedApplication] = await sql`
        UPDATE memberships
        SET 
          status = ${body.status},
          notes = ${body.notes},
          reviewed_by = ${body.staff_id},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (body.status === 'verified') {
        await sql`
          UPDATE visitors
          SET member_status = 'member'
          WHERE id = (SELECT user_id FROM memberships WHERE id = ${id})
        `;
      }

      return NextResponse.json({
        success: true,
        data: updatedApplication,
        message: `Membership application status updated`
      });
    }

    // Otherwise, update all fields (user-side full update)
    const [updatedApplication] = await sql`
      UPDATE memberships
      SET 
        full_name = ${body.full_name},
        email = ${body.email},
        phone_number = ${body.phone_number},
        address = ${body.address},
        favorite_book_genre = ${body.favorite_book_genre},
        emergency_contact_name = ${body.emergency_contact_name},
        emergency_contact_number = ${body.emergency_contact_number},
        id_card_url = ${body.id_card_url},
        status = ${body.status},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: `Membership application updated`
    });
  } catch (error) {
    console.error('Error updating membership application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 