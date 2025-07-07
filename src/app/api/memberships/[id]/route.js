import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/app/lib/send-email';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

// Function to generate a branded HTML email template
const createEmailTemplate = (title, content, visitorName) => {
  // Use NEXT_PUBLIC_URL for absolute URL, fallback to Vercel/production domain or localhost
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://the-room-19.vercel.app' || 'http://localhost:3000';
  const dashboardUrl = `${baseUrl}/user/dashboard`;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
          <tr>
              <td align="center">
                  <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; margin-top: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                          <td align="center" style="padding: 20px 0; border-bottom: 1px solid #eeeeee;">
                              <h1 style="margin: 0; color: #1a202c; font-size: 28px;">The Room 19</h1>
                          </td>
                      </tr>
                      <!-- Content -->
                      <tr>
                          <td style="padding: 30px 40px;">
                              <h1 style="color: #1a202c; font-size: 24px;">${title}</h1>
                              <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Hi ${visitorName},</p>
                              <div style="color: #4a5568; font-size: 16px; line-height: 1.5;">
                                  ${content}
                              </div>
                          </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                          <td align="center" style="padding: 20px 40px; border-top: 1px solid #eeeeee; font-size: 12px; color: #718096;">
                              <p>&copy; ${new Date().getFullYear()} The Room 19. All rights reserved.</p>
                              <p>If you have any questions, please visit our website or contact support.</p>
                              <a href="${dashboardUrl}" style="color: #2e3105; text-decoration: none;">Visit The Room 19</a>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>
  `;
};

// Refactored function to send notification emails
async function sendNotificationEmail(status, notes, membershipId) {
    if (status !== 'verified' && status !== 'revision') {
      return;
    }

    const [membership] = await sql`SELECT user_id FROM memberships WHERE id = ${membershipId}`;
    if (!membership) {
        console.error(`Membership with ID ${membershipId} not found for sending email.`);
        return;
    }

    const [visitor] = await sql`SELECT email, name FROM visitors WHERE id = ${membership.user_id}`;
    if (!visitor) {
        console.error(`Visitor for membership ID ${membershipId} not found.`);
        return;
    }

    let subject, emailContent;
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://the-room-19.vercel.app' || 'http://localhost:3000';

    if (status === 'verified') {
        subject = 'Your Membership is Approved!';
        emailContent = `
            <p>Congratulations! Your membership at The Room 19 Library has been <b>approved</b>.</p>
            <p>You can now explore our collection and enjoy all the member benefits. Welcome to our community!</p>
            <br>
            <p style="text-align: center;">
                <a href="${baseUrl}/user/dashboard/books/catalog" style="display: inline-block; padding: 12px 24px; background-color: #2e3105; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Browse Books
                </a>
            </p>
        `;
    } else if (status === 'revision') {
        subject = 'Membership Application Needs Revision';
        emailContent = `
            <p>Thank you for your application. We've reviewed it and found that it requires a few changes before we can approve it.</p>
            <p><b>Reason for revision:</b></p>
            <blockquote style="border-left: 4px solid #dddddd; padding-left: 15px; margin-left: 0; color: #718096;">
                ${notes || 'Please review your submitted information and ensure it is correct.'}
            </blockquote>
            <p>Please log in to your account to make the necessary corrections.</p>
            <br>
            <p style="text-align: center;">
                <a href="${baseUrl}/user/dashboard/membership" style="display: inline-block; padding: 12px 24px; background-color: #2e3105; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Revise Application
                </a>
            </p>
        `;
    }

    const html = createEmailTemplate(subject, emailContent, visitor.name);
    
    console.log(`[EMAIL DEBUG] Sending email to: ${visitor.email}, subject: ${subject}, status: ${status}`);
    try {
        await sendEmail({ to: visitor.email, subject, html });
    } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Do not throw, just log
    }
}

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

export async function PUT(req, { params }) {
  const { id } = params;
  try {
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    let updatedApplication;
    // If status is present, update membership and visitor as needed
    if (typeof body.status !== 'undefined') {
      const { status, notes, staff_id } = body;
      [updatedApplication] = await sql`
        UPDATE memberships
        SET 
          status = ${status},
          notes = ${notes || null},
          reviewed_by = ${staff_id || null},
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

      // Send email notification if status is verified or revision
      await sendNotificationEmail(status, notes, id);

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
        status = ${body.status || 'request'},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    // When a user resubmits, the status becomes 'request'.
    // If it's a revision, we might want to notify them upon successful submission.
    // However, the email is designed for staff actions ('verified', 'revision').
    // So no email is sent here, which is correct based on current logic.

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