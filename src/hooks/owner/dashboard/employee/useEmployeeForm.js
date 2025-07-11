"use client";

import { useState } from 'react';

export function useEmployeeForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    department: '',
    shift: '',
    email: '',
    phone: '',
    address: '',
    age: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required.';
    if (!formData.gender) newErrors.gender = 'Gender is required.';
    if (!formData.department.trim()) newErrors.department = 'Department is required.';
    if (!formData.shift) newErrors.shift = 'Shift is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required.';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid.';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createEmployee = async () => {
    if (!validateForm()) {
      return { success: false, error: 'Please fix the form errors' };
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create employee');
      }

      return { 
        success: true, 
        employee: data.employee,
        tempPassword: data.tempPassword 
      };
    } catch (error) {
      console.error('Error creating employee:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create employee' 
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      gender: '',
      department: '',
      shift: '',
      email: '',
      phone: '',
      address: '',
      age: ''
    });
    setFormErrors({});
  };

  return {
    formData,
    formErrors,
    isSubmitting,
    handleFormChange,
    validateForm,
    createEmployee,
    resetForm
  };
} 