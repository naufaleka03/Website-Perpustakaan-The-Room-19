export const createNewEmployee = (formData, employeeCount) => {
  return {
    no: employeeCount + 1,
    name: formData.fullName,
    department: formData.department,
    shift: formData.shift,
    hireDate: new Date().toISOString().split('T')[0],
    gender: formData.gender,
    status: 'Active',
    email: formData.email,
    phone: formData.phone,
    workingHours: 0, // New employees start with 0 working hours
  };
};

export const handleWarning = async (employee, reason) => {
  try {
    // Store warning in database (you can create a separate warnings table)
    console.log(`Warning for ${employee.name}: ${reason}`);
    // TODO: Implement warning storage in database
    return true;
  } catch (error) {
    console.error('Error handling warning:', error);
    return false;
  }
};

export const handleRevokeAccess = async (employee, terminationLetter) => {
  try {
    const response = await fetch('/api/employees', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: employee.id,
        status: 'Non-Active',
        reason: 'Access revoked by owner',
        terminationLetter: terminationLetter
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to revoke access');
    }

    const result = await response.json();
    console.log('Access revoked successfully:', result);
    return true;
  } catch (error) {
    console.error('Error revoking access:', error);
    return false;
  }
};

export const handleReinstate = async (employee) => {
  try {
    const response = await fetch('/api/employees', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: employee.id,
        status: 'Active',
        reason: 'Access reinstated by owner'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reinstate access');
    }

    const result = await response.json();
    console.log('Access reinstated successfully:', result);
    return true;
  } catch (error) {
    console.error('Error reinstating access:', error);
    return false;
  }
}; 