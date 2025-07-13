import { NextResponse } from 'next/server';
import { createClient } from '@/app/supabase/server';

/**
 * POST /api/staff-management/employee-operations
 * Handles all employee operations: create, update, delete, status changes
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { operation, data } = body;

    switch (operation) {
      case 'create':
        return await createEmployee(data);
      case 'update':
        return await updateEmployee(data);
      case 'delete':
        return await deleteEmployee(data);
      case 'update_status':
        return await updateEmployeeStatus(data);
      case 'send_warning':
        return await sendWarning(data);
      case 'revoke_access':
        return await revokeAccess(data);
      case 'reinstate_access':
        return await reinstateAccess(data);
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in employee operations:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Create a new employee
 */
async function createEmployee(data) {
  try {
    const supabase = await createClient();
    const {
      fullName,
      gender,
      department,
      shift,
      email,
      phone,
      address = '',
      age
    } = data;

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
      success: true,
      message: 'Employee created successfully',
      employee: employeeData,
      tempPassword
    });

  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Update employee information
 */
async function updateEmployee(data) {
  try {
    const supabase = await createClient();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const { data: updatedEmployee, error: updateError } = await supabase
      .from('staffs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating employee:', updateError);
      return NextResponse.json(
        { error: 'Failed to update employee', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });

  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Delete employee
 */
async function deleteEmployee(data) {
  try {
    const supabase = await createClient();
    const { id } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('staffs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting employee:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete employee', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Update employee status (Active/Non-Active)
 */
async function updateEmployeeStatus(data) {
  try {
    const supabase = await createClient();
    const { id, status, reason, terminationLetter } = data;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id and status' },
        { status: 400 }
      );
    }

    // Validate status values
    const validStatuses = ['Active', 'Non-Active'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be either "Active" or "Non-Active"' },
        { status: 400 }
      );
    }

    // Update employee status
    const { data: updatedEmployee, error: updateError } = await supabase
      .from('staffs')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating employee status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update employee status', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Employee status updated to ${status} successfully`,
      employee: updatedEmployee
    });

  } catch (error) {
    console.error('Error updating employee status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Send warning to employee
 */
async function sendWarning(data) {
  try {
    const { employeeId, reason } = data;

    if (!employeeId || !reason) {
      return NextResponse.json(
        { error: 'Employee ID and reason are required' },
        { status: 400 }
      );
    }

    // Here you would typically log the warning to a warnings table
    // For now, we'll just return success
    console.log(`Warning sent to employee ${employeeId}: ${reason}`);

    return NextResponse.json({
      success: true,
      message: 'Warning sent successfully'
    });

  } catch (error) {
    console.error('Error sending warning:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Revoke employee access
 */
async function revokeAccess(data) {
  try {
    const { employeeId, terminationLetter } = data;

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Update employee status to Non-Active
    const result = await updateEmployeeStatus({
      id: employeeId,
      status: 'Non-Active'
    });

    if (result.status !== 200) {
      return result;
    }

    // Here you would typically log the termination letter
    if (terminationLetter) {
      console.log(`Termination letter for employee ${employeeId}: ${terminationLetter}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Employee access revoked successfully'
    });

  } catch (error) {
    console.error('Error revoking access:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Reinstate employee access
 */
async function reinstateAccess(data) {
  try {
    const { employeeId } = data;

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Update employee status to Active
    const result = await updateEmployeeStatus({
      id: employeeId,
      status: 'Active'
    });

    if (result.status !== 200) {
      return result;
    }

    return NextResponse.json({
      success: true,
      message: 'Employee access reinstated successfully'
    });

  } catch (error) {
    console.error('Error reinstating access:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 