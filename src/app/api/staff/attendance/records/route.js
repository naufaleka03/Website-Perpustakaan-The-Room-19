import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function GET(request) {
  // Support debug mode
  const { searchParams } = new URL(request.url);
  if (searchParams.get('debug') === '1') {
    return await GET_DEBUG();
  }
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const staffId = searchParams.get('staff_id');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

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
      WHERE 1=1
    `;

    const params = [];

    if (startDate && endDate) {
      query += ` AND ar.date BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(startDate, endDate);
    } else if (date) {
      query += ` AND ar.date = $${params.length + 1}`;
      params.push(date);
    }

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
    console.log('Attendance API query:', query);
    console.log('Attendance API params:', params);

    // Convert all params to strings to avoid 'in' operator error
    const safeParams = params.map(p => p !== undefined && p !== null ? String(p) : null);

    let records;
    if (safeParams.length > 0) {
      records = await sql.unsafe(query, safeParams);
    } else {
      records = await sql.unsafe(query);
    }

    return NextResponse.json({ 
      records: records,
      count: records.length
    });

  } catch (error) {
    console.error('Error fetching attendance records:', error);
    if (error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to fetch attendance records', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
} 

// Add a debug endpoint for listing all attendance records for today
export async function GET_DEBUG() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const records = await sql`SELECT * FROM attendance_records WHERE date = ${today}`;
    return NextResponse.json({ records });
  } catch (error) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
} 