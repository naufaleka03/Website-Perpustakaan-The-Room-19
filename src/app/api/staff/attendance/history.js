import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

/**
 * GET /api/staff/attendance/history
 * Fetches attendance history with various filters
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const selectedRange = searchParams.get('range') || 'today';
    const staffId = searchParams.get('staff_id');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Get date range based on selected range
    const { start, end } = getDateRange(selectedRange);

    let query = `
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
      WHERE ar.date BETWEEN $1 AND $2
    `;

    const params = [start, end];

    if (staffId && staffId !== 'all') {
      query += ` AND ar.staff_id = $${params.length + 1}`;
      params.push(staffId);
    }

    if (status && status !== 'all') {
      query += ` AND ar.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY ar.timestamp DESC`;

    // Debug log for query and params
    console.log('History API query:', query);
    console.log('History API params:', params);

    // Convert all params to strings to avoid 'in' operator error
    const safeParams = params.map(p => p !== undefined && p !== null ? String(p) : null);

    let records;
    if (safeParams.length > 0) {
      records = await sql.unsafe(query, safeParams);
    } else {
      records = await sql.unsafe(query);
    }

    // Get staff data for name lookups
    const staffResponse = await sql`
      SELECT id, name, department FROM staffs WHERE status = 'Active'
    `;

    // Process records with additional data
    const processedRecords = records.map(record => {
      const staffMember = staffResponse.find(s => s.id === record.staff_id);
      return {
        ...record,
        staff_name: staffMember?.name || 'Unknown Staff',
        department: staffMember?.department || 'Unknown Department'
      };
    });

    return NextResponse.json({ 
      success: true,
      records: processedRecords,
      count: processedRecords.length,
      dateRange: { start, end, selectedRange }
    });

  } catch (error) {
    console.error('Error fetching attendance history:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch attendance history', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get date range for API
 * @param {string} option - Date range option
 * @returns {Object} - Start and end dates
 */
function getDateRange(option) {
  const now = new Date();
  if (option === 'today') {
    const today = now.toISOString().split('T')[0];
    return { start: today, end: today };
  } else if (option === 'thisweek') {
    const first = now.getDate() - now.getDay();
    const last = first + 6;
    const firstDay = new Date(now.setDate(first));
    const lastDay = new Date(now.setDate(last));
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  } else if (option === 'thismonth') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  }
  // Default to today
  const today = new Date().toISOString().split('T')[0];
  return { start: today, end: today };
} 