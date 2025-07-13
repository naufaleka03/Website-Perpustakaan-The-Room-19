import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { processAttendanceRecords } from './process-records.js';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

/**
 * POST /api/staff/attendance/actions
 * Handles attendance actions: submit attendance, clock-out, early clock-out
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const action = formData.get('action'); // 'submit_attendance', 'clock_out', 'early_clock_out'
    const staffNo = formData.get('staffNo');
    const status = formData.get('status');
    const timestamp = formData.get('timestamp');
    const evidence = formData.get('evidence');

    console.log('Received attendance action:', { action, staffNo, status, timestamp });

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

    let staffId;
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
      staffId = staffByEmployeeIdResult[0].id;
    } else {
      console.log('Found staff by ID:', staffResult[0]);
      staffId = staffResult[0].id;
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

    // Fetch updated attendance records for the day
    const updatedRecordsResponse = await sql`
      SELECT 
        ar.id,
        ar.staff_id,
        ar.status,
        ar.timestamp,
        ar.evidence_url,
        ar.date,
        s.name as staff_name,
        s.department,
        s.employee_id,
        s.shift
      FROM attendance_records ar
      JOIN staffs s ON ar.staff_id = s.id
      WHERE ar.date = ${dateOnly}
      ORDER BY ar.timestamp DESC
    `;

    // Process the updated records
    const processedRecords = processAttendanceRecords(updatedRecordsResponse);

    console.log('Attendance action completed successfully for staff ID:', staffId);

    return NextResponse.json({
      success: true,
      staffNo: staffNo,
      staffId: staffId,
      action: action,
      status: status,
      timestamp: timestamp,
      message: 'Attendance action completed successfully',
      updatedRecords: processedRecords
    });

  } catch (error) {
    console.error('Error processing attendance action:', error);
    return NextResponse.json(
      { error: 'Failed to process attendance action', details: error.message },
      { status: 500 }
    );
  }
} 