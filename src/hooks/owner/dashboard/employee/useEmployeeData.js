"use client";

import { useState, useEffect } from 'react';

const defaultEmployeesData = [
  { no: 1, name: 'Penny Traiton', department: 'Staff', workingHours: 160, shift: 'A', hireDate: '2022-08-29', gender: 'M', status: 'Active', age: 28, address: '123 Maple St, Springfield', phone: '+1-202-555-0104', email: 'penny.t@example.com' },
  { no: 2, name: 'Anna Bors', department: 'Librarian', workingHours: 145, shift: 'B', hireDate: '2021-02-21', gender: 'F', status: 'Non-Active', age: 34, address: '456 Oak Ave, Shelbyville', phone: '+1-202-555-0157', email: 'anna.b@example.com' },
  { no: 3, name: 'John Smith', department: 'Staff', workingHours: 180, shift: 'A', hireDate: '2023-01-15', gender: 'M', status: 'Active', age: 25, address: '789 Pine Ln, Capital City', phone: '+1-202-555-0162', email: 'john.s@example.com' },
  { no: 4, name: 'Alice Johnson', department: 'Librarian', workingHours: 155, shift: 'C', hireDate: '2022-05-10', gender: 'F', status: 'Active', age: 31, address: '101 Elm Rd, Ogdenville', phone: '+1-202-555-0188', email: 'alice.j@example.com' },
  { no: 5, name: 'Bob Williams', department: 'Maintenance', workingHours: 140, shift: 'A', hireDate: '2023-03-01', gender: 'M', status: 'Non-Active', age: 45, address: '212 Birch Blvd, North Haverbrook', phone: '+1-202-555-0199', email: 'bob.w@example.com' },
  { no: 6, name: 'Eva Brown', department: 'Staff', workingHours: 165, shift: 'B', hireDate: '2021-11-20', gender: 'F', status: 'Active', age: 29, address: '333 Cedar Ct, Brockway', phone: '+1-202-555-0143', email: 'eva.b@example.com' },
  { no: 7, name: 'Michael Davis', department: 'Security', workingHours: 175, shift: 'C', hireDate: '2023-07-01', gender: 'M', status: 'Active', age: 38, address: '444 Spruce Way, Lanley', phone: '+1-202-555-0177', email: 'michael.d@example.com' },
];

export function useEmployeeData() {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allEmployees, setAllEmployees] = useState([]);
  const [employeesToDisplay, setEmployeesToDisplay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employees from database
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/employees');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch employees');
      }
      
      // Transform database data to match the expected format
      const transformedEmployees = data.employees.map((emp, index) => ({
        id: emp.id, // Ensure id is present for delete feature
        no: emp.id || index + 1,
        name: emp.name,
        department: emp.department || emp.position,
        workingHours: emp.working_hours || Math.floor(Math.random() * 200) + 100, // Default random hours
        shift: emp.shift,
        hireDate: emp.hire_date ? emp.hire_date.split('T')[0] : new Date().toISOString().split('T')[0],
        gender: emp.gender,
        status: emp.status || 'Active',
        age: emp.age,
        address: emp.address || '',
        phone: emp.phone_number || emp.phone,
        email: emp.email
      }));
      
      setAllEmployees(transformedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError(error.message);
      // Fallback to default data if API fails
      setAllEmployees(defaultEmployeesData);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Refresh employees from database
  const refreshEmployees = async () => {
    await fetchEmployees();
  };

  // Filter and save data
  useEffect(() => {
    if (allEmployees.length > 0) {
      localStorage.setItem('employees', JSON.stringify(allEmployees));
    }
    
    let filtered = allEmployees;

    if (selectedStatus) {
      filtered = filtered.filter(emp => emp.status === selectedStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setEmployeesToDisplay(filtered);
  }, [searchQuery, selectedStatus, allEmployees]);

  const addEmployee = (newEmployee) => {
    setAllEmployees(prevEmployees => [...prevEmployees, newEmployee]);
  };

  const updateEmployeeStatus = (employeeNo, newStatus) => {
    setAllEmployees(prevEmployees => 
      prevEmployees.map(emp => 
        emp.no === employeeNo ? { ...emp, status: newStatus } : emp
      )
    );
  };

  const updateEmployee = (updatedEmployee) => {
    setAllEmployees(prevEmployees => 
      prevEmployees.map(emp => 
        emp.no === updatedEmployee.no ? updatedEmployee : emp
      )
    );
  };

  return {
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    allEmployees,
    employeesToDisplay,
    loading,
    error,
    addEmployee,
    updateEmployeeStatus,
    updateEmployee,
    refreshEmployees
  };
} 