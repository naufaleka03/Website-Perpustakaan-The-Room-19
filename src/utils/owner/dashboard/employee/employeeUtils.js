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

export const handleWarning = (employee, reason) => {
  // This would typically make an API call
  console.log(`Warning for ${employee.name}: ${reason}`);
  return true;
};

export const handleRevokeAccess = (employee, terminationLetter) => {
  // This would typically make an API call
  if (terminationLetter) {
    console.log(`Termination letter for ${employee.name}:`, terminationLetter);
  }
  return true;
};

export const handleReinstate = (employee) => {
  // This would typically make an API call
  console.log(`Reinstating ${employee.name}`);
  return true;
}; 