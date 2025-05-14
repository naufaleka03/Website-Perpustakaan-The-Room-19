import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const [application] = await sql`
      SELECT * FROM membership_applications
      WHERE id = ${id}
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
    
    // Validate the request
    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // Check if the application exists
    const [existingApplication] = await sql`
      SELECT id, status, user_id 
      FROM membership_applications
      WHERE id = ${id}
    `;

    if (!existingApplication) {
      return NextResponse.json({ error: 'Membership application not found' }, { status: 404 });
    }

    // Update the application status
    if (body.status) {
      const validStatuses = ['request', 'processing', 'verified', 'revision', 'rejected'];
      
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status value. Must be one of: request, processing, verified, revision, rejected' },
          { status: 400 }
        );
      }

      // Update the application status
      const [updatedApplication] = await sql`
        UPDATE membership_applications 
        SET 
          status = ${body.status},
          notes = ${body.notes || null},
          reviewed_by = ${body.staff_id || null},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, full_name, email, status, updated_at
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