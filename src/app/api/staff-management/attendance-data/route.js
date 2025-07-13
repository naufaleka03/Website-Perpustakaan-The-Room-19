import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

/**
 * GET /api/staff-management/attendance-data
 * Fetches attendance data for owner dashboard
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const timeFilter = searchParams.get('timeFilter') || 'all';

    // Fetch attendance records for the specified date
    const records = await sql`
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
      WHERE ar.date = ${date}
      ORDER BY ar.timestamp DESC
    `;

    // Filter records based on time filter
    const filteredRecords = filterRecordsByTime(records, timeFilter);

    return NextResponse.json({
      success: true,
      records: filteredRecords,
      count: filteredRecords.length,
      date: date,
      timeFilter: timeFilter
    });

  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance data', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Filter attendance records based on time period
 */
function filterRecordsByTime(records, timeFilter) {
  if (timeFilter === 'all') {
    return records;
  }

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  return records.filter(record => {
    const recordDate = new Date(record.date);
    
    switch (timeFilter) {
      case 'today':
        return record.date === todayString;
      case 'last7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return recordDate >= sevenDaysAgo && recordDate <= today;
      case 'lastmonth':
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        return recordDate >= lastMonth && recordDate <= today;
      default:
        return true;
    }
  });
} 