import { NextResponse } from 'next/server';
import { createClient } from '@/app/supabase/server';

/**
 * GET /api/staff-management/payroll-data
 * Fetches payroll data for owner dashboard
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    
    const { data: employees, error } = await supabase
      .from('staffs')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching payroll data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payroll data', details: error.message },
        { status: 500 }
      );
    }

    // Process payroll data (add working hours and payment dates)
    const payrollData = employees.map(employee => ({
      ...employee,
      working_hours: employee.working_hours || 0,
      payment_date: employee.payment_date || new Date().toISOString().split('T')[0]
    }));

    return NextResponse.json({
      success: true,
      employees: payrollData,
      count: payrollData.length
    });

  } catch (error) {
    console.error('Error in payroll data API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 