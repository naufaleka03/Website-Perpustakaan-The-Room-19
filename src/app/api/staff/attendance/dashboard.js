import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { processAttendanceRecords, getCurrentShiftStaff, getNonActiveStaff } from './process-records.js';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

/**
 * GET /api/staff/attendance/dashboard
 * Fetches all data needed for the attendance dashboard
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const hour = parseInt(searchParams.get('hour')) || new Date().getHours();
    const searchQuery = searchParams.get('search') || '';
    const useMockHour = searchParams.get('useMockHour') === 'true';
    
    // Fetch all Active staff
    const staffResponse = await sql`
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

    const allStaff = staffResponse;
    
    // Log any Non-Active staff for debugging
    const nonActiveStaff = getNonActiveStaff(allStaff);
    if (nonActiveStaff.length > 0) {
      console.warn('Non-Active staff found in API response:', nonActiveStaff);
    }

    // Fetch today's attendance records
    const today = new Date().toISOString().split('T')[0];
    const recordsResponse = await sql`
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
      WHERE ar.date = ${today}
      ORDER BY ar.timestamp DESC
    `;

    // Process attendance records
    const processedRecords = processAttendanceRecords(recordsResponse);
    
    // Get current shift staff
    const currentShiftStaff = getCurrentShiftStaff(allStaff, hour);
    
    // Filter staff by search query
    const filteredStaff = allStaff.filter(staff =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return NextResponse.json({
      success: true,
      data: {
        allStaff,
        currentShiftStaff,
        filteredStaff,
        attendanceRecords: processedRecords,
        nonActiveStaff,
        currentHour: hour,
        useMockHour
      },
      meta: {
        totalStaff: allStaff.length,
        currentShiftStaffCount: currentShiftStaff.length,
        filteredStaffCount: filteredStaff.length,
        attendanceRecordsCount: recordsResponse.length
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch dashboard data', 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 