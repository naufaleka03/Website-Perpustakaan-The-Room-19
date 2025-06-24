import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/app/lib/send-email';

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

export async function PUT(req, context) {
  const { params } = await context;
  const id = params.id;
  try {
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    let updatedApplication;
    // If status is present, update membership and visitor as needed
    if (typeof body.status !== 'undefined') {
      [updatedApplication] = await sql`
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
      if (body.status === 'revoked') {
        console.log('About to update visitor to guest for membership id:', id);
        const result = await sql`
          UPDATE visitors
          SET member_status = 'guest'
          WHERE id = (SELECT user_id FROM memberships WHERE id = ${id})
        `;
        console.log('Visitor update result:', result);
      }

      // Send email notification if status is verified or revision (for staff actions)
      if (body.status === 'verified' || body.status === 'revision') {
        // Fetch the visitor's email and name
        const [visitor] = await sql`
          SELECT email, name FROM visitors WHERE id = (SELECT user_id FROM memberships WHERE id = ${id})
        `;
        if (visitor) {
          let subject, html;
          if (body.status === 'verified') {
            subject = 'Your Membership is Approved!';
            html = `<p>Hi ${visitor.name},</p>
                    <p>Congratulations! Your membership at The Room 19 Library has been <b>approved</b>. You can now borrow books and enjoy member benefits.</p>`;
          } else if (body.status === 'revision') {
            subject = 'Membership Application Needs Revision';
            html = `<p>Hi ${visitor.name},</p>
                    <p>Your membership application needs some changes:</p>
                    <blockquote>${body.notes}</blockquote>
                    <p>Please log in and update your submission.</p>`;
          }
          console.log(`[EMAIL DEBUG] Sending email to: ${visitor.email}, subject: ${subject}, status: ${body.status}`);
          try {
            await sendEmail({ to: visitor.email, subject, html });
          } catch (emailError) {
            console.error('Failed to send notification email:', emailError);
            // Do not throw, just log
          }
        }
      }

      return NextResponse.json({
        success: true,
        data: updatedApplication,
        message: `Membership application status updated`
      });
    }

    // Otherwise, update all fields (user-side full update)
    [updatedApplication] = await sql`
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

    // Send email notification if status is verified or revision (for both update paths)
    if (body.status === 'verified' || body.status === 'revision') {
      // Fetch the visitor's email and name
      const [visitor] = await sql`
        SELECT email, name FROM visitors WHERE id = (SELECT user_id FROM memberships WHERE id = ${id})
      `;
      if (visitor) {
        let subject, html;
        if (body.status === 'verified') {
          subject = 'Your Membership is Approved!';
          html = `<p>Hi ${visitor.name},</p>
                  <p>Congratulations! Your membership at The Room 19 Library has been <b>approved</b>. You can now borrow books and enjoy member benefits.</p>`;
        } else if (body.status === 'revision') {
          subject = 'Membership Application Needs Revision';
          html = `<p>Hi ${visitor.name},</p>
                  <p>Your membership application needs some changes:</p>
                  <blockquote>${body.notes}</blockquote>
                  <p>Please log in and update your submission.</p>`;
        }
        console.log(`[EMAIL DEBUG] Sending email to: ${visitor.email}, subject: ${subject}, status: ${body.status}`);
        try {
          await sendEmail({ to: visitor.email, subject, html });
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
          // Do not throw, just log
        }
      }
    }

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