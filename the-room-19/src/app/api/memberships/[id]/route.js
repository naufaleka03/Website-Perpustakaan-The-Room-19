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

    // Check if the application exists
    const [existingApplication] = await sql`
      SELECT id, status, user_id 
      FROM memberships
      WHERE id = ${id}
    `;

    if (!existingApplication) {
      return NextResponse.json({ error: 'Membership application not found' }, { status: 404 });
    }

    // Update the application status
    if (body.status) {
      const validStatuses = ['verified', 'revision'];
      
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status value. Must be one of: verified, revision' },
          { status: 400 }
        );
      }

      // Update the application status
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

      // If application is verified, update the user's member_status
      if (body.status === 'verified') {
        await sql`
          UPDATE visitors
          SET member_status = 'member'
          WHERE id = ${existingApplication.user_id}
        `;
      }

      return NextResponse.json({
        success: true,
        data: updatedApplication,
        message: `Membership application status updated to ${body.status}`
      });
    }

    return NextResponse.json({ error: 'Invalid update operation' }, { status: 400 });
  } catch (error) {
    console.error('Error in PUT membership application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 