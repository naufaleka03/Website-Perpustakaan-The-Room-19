import { NextResponse } from 'next/server';
import { createClient } from '@/app/supabase/server';

// GET /api/employees - Fetch all employees
export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: employees, error } = await supabase
      .from('staffs')
      .select('*');

    if (error) {
      console.error('Error fetching employees:', error);
      return NextResponse.json(
        { error: 'Failed to fetch employees', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ employees: employees || [] });
  } catch (error) {
    console.error('Error in GET /api/employees:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/employees - Add new employee
export async function POST(request) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const {
      fullName,
      gender,
      department,
      shift,
      email,
      phone,
      address = '',
      age
    } = body;

    // Validate required fields
    if (!fullName || !gender || !department || !shift || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingEmployee, error: checkError } = await supabase
      .from('staffs')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing employee:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing employee', details: checkError.message },
        { status: 500 }
      );
    }

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      );
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    // Insert into staffs table
    const { data: employeeData, error: insertError } = await supabase
      .from('staffs')
      .insert([{
        name: fullName,
        email,
        phone_number: phone,
        position: department,
        hire_date: new Date().toISOString(),
        employee_id: `EMP${Date.now()}`,
        gender,
        department,
        shift,
        address,
        age: age ? parseInt(age) : null,
        status: 'Active'
        // password: tempPassword // Removed, do not store password
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting employee:', insertError);
      return NextResponse.json(
        { error: 'Failed to create employee profile', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Employee created successfully',
      employee: employeeData,
      tempPassword
    });

  } catch (error) {
    console.error('Error in POST /api/employees:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/employees?id=... - Delete employee by id
export async function DELETE(request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing employee id' }, { status: 400 });
    }
    const { error } = await supabase
      .from('staffs')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting employee:', error);
      return NextResponse.json({ error: 'Failed to delete employee', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/employees:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
} 