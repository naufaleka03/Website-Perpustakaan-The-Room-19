import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function POST(request) {
  try {
    const formData = await request.formData();
    const staffNo = formData.get('staffNo');
    const status = formData.get('status');
    const timestamp = formData.get('timestamp');
    const evidence = formData.get('evidence');

    console.log('Received attendance data:', { staffNo, status, timestamp });

    if (!staffNo || !status || !timestamp) {
      console.log('Missing required fields:', { staffNo, status, timestamp });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert timestamp to Date object
    const attendanceDate = new Date(timestamp);
    if (isNaN(attendanceDate.getTime())) {
      console.log('Invalid timestamp:', timestamp);
      return NextResponse.json(
        { error: 'Invalid timestamp value' },
        { status: 400 }
      );
    }
    const dateOnly = attendanceDate.toISOString().split('T')[0];

    console.log('Looking for staff with employee_id:', staffNo);

    // First, try to get the staff by ID (since frontend now sends staff.id)
    const staffResult = await sql`
      SELECT id, name, employee_id FROM staffs WHERE id = ${staffNo}
    `;

    console.log('Staff query result:', staffResult);

    if (staffResult.length === 0) {
      // Try to find staff by employee_id if ID doesn't work
      const staffByEmployeeIdResult = await sql`
        SELECT id, name, employee_id FROM staffs WHERE employee_id = ${staffNo}
      `;
      
      if (staffByEmployeeIdResult.length === 0) {
        console.log('Staff not found by id or employee_id:', staffNo);
        return NextResponse.json(
          { error: 'Staff not found' },
          { status: 404 }
        );
      }
      
      console.log('Found staff by employee_id:', staffByEmployeeIdResult[0]);
      var staffId = staffByEmployeeIdResult[0].id;
    } else {
      console.log('Found staff by ID:', staffResult[0]);
      var staffId = staffResult[0].id;
    }

    // Check if attendance already exists for this staff on this date with the same status
    const existingRecord = await sql`
      SELECT id FROM attendance_records 
      WHERE staff_id = ${staffId} AND date = ${dateOnly} AND status = ${status}
    `;

    console.log('Existing attendance record:', existingRecord);

    if (existingRecord.length > 0) {
      // Update existing record (keep this for idempotency, but usually not needed)
      console.log('Updating existing attendance record');
      await sql`
        UPDATE attendance_records 
        SET timestamp = ${timestamp}
        WHERE staff_id = ${staffId} AND date = ${dateOnly} AND status = ${status}
      `;
    } else {
      // Insert new record for this status
      console.log('Inserting new attendance record');
      await sql`
        INSERT INTO attendance_records (staff_id, status, timestamp, date)
        VALUES (${staffId}, ${status}, ${timestamp}, ${dateOnly})
      `;
    }

    // Handle evidence file upload if provided
    let evidenceUrl = null;
    if (evidence && evidence.size > 0) {
      // Here you would typically upload to a cloud storage service
      // For now, we'll just store a placeholder
      evidenceUrl = `/uploads/attendance/${staffId}_${dateOnly}_${Date.now()}.jpg`;
    }

    // Update evidence URL if we have one
    if (evidenceUrl) {
      await sql`
        UPDATE attendance_records 
        SET evidence_url = ${evidenceUrl}
        WHERE staff_id = ${staffId} AND date = ${dateOnly} AND status = ${status}
      `;
    }

    console.log('Attendance recorded successfully for staff ID:', staffId);

    return NextResponse.json({
      success: true,
      staffNo: staffNo,
      staffId: staffId,
      message: 'Attendance recorded successfully'
    });

  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      { error: 'Failed to record attendance', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  // Support debug mode
  if (request && request.url) {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('debug') === '1') {
      return await GET_DEBUG();
    }
  }
  try {
    // Fetch all staff for attendance page
    const staff = await sql`
      SELECT 
        id,
        name,
        email,
        phone_number,
        position,
        hire_date,
        profile_picture,
        employee_id as no,
        status,
        department,
        shift,
        age,
        address
      FROM staffs 
      WHERE status = 'Active'
      ORDER BY name
    `;

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
} 

// Add a debug endpoint for listing all staff and all attendance records for today
export async function GET_DEBUG() {
  try {
    const staff = await sql`SELECT * FROM staffs`;
    const today = new Date().toISOString().split('T')[0];
    const records = await sql`SELECT * FROM attendance_records WHERE date = ${today}`;
    return NextResponse.json({ staff, records });
  } catch (error) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
} 