"use client";

import { useState, useEffect } from 'react';

export function useEmployeeModals() {
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [employeeToRevoke, setEmployeeToRevoke] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [employeeForDetails, setEmployeeForDetails] = useState(null);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [employeeToWarn, setEmployeeToWarn] = useState(null);
  const [warningReason, setWarningReason] = useState('');
  const [terminationLetter, setTerminationLetter] = useState(null);
  
  // Edit functionality states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});

  // Handle escape key for modals
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsRevokeModalOpen(false);
        setIsDetailsModalOpen(false);
        setIsWarningModalOpen(false);
        if (isEditMode) {
          setIsEditMode(false);
        }
      }
    };

    if (isRevokeModalOpen || isDetailsModalOpen || isWarningModalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isRevokeModalOpen, isDetailsModalOpen, isWarningModalOpen, isEditMode]);

  const handleOpenRevokeModal = (employee) => {
    setEmployeeToRevoke(employee);
    setIsRevokeModalOpen(true);
  };

  const handleCloseRevokeModal = () => {
    setIsRevokeModalOpen(false);
    setEmployeeToRevoke(null);
    setTerminationLetter(null);
  };

  const handleOpenWarningModal = (employee) => {
    setEmployeeToWarn(employee);
    setIsWarningModalOpen(true);
  };

  const handleCloseWarningModal = () => {
    setIsWarningModalOpen(false);
    setEmployeeToWarn(null);
    setWarningReason('');
  };

  const handleOpenDetailsModal = (employee) => {
    setEmployeeForDetails(employee);
    setIsDetailsModalOpen(true);
    setIsEditMode(false);
    setEditFormData({});
    setEditFormErrors({});
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setEmployeeForDetails(null);
    setIsEditMode(false);
    setEditFormData({});
    setEditFormErrors({});
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setTerminationLetter(e.target.files[0]);
    } else {
      setTerminationLetter(null);
    }
  };

  // Edit functionality handlers
  const handleStartEdit = (employee) => {
    setEditFormData({
      fullName: employee.name,
      gender: employee.gender,
      department: employee.department,
      shift: employee.shift,
      email: employee.email,
      phone: employee.phone,
      address: employee.address,
      age: employee.age,
    });
    setEditFormErrors({});
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFormData({});
    setEditFormErrors({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEditForm = () => {
    const newErrors = {};
    if (!editFormData.fullName?.trim()) newErrors.fullName = 'Full Name is required.';
    if (!editFormData.gender) newErrors.gender = 'Gender is required.';
    if (!editFormData.department?.trim()) newErrors.department = 'Department is required.';
    if (!editFormData.shift) newErrors.shift = 'Shift is required.';
    if (!editFormData.email?.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!editFormData.phone?.trim()) {
      newErrors.phone = 'Phone Number is required.';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(editFormData.phone)) {
      newErrors.phone = 'Phone number is invalid.';
    }
    if (!editFormData.address?.trim()) newErrors.address = 'Address is required.';
    if (!editFormData.age || editFormData.age < 18 || editFormData.age > 100) {
      newErrors.age = 'Age must be between 18 and 100.';
    }
    
    setEditFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    isRevokeModalOpen,
    employeeToRevoke,
    isDetailsModalOpen,
    employeeForDetails,
    isWarningModalOpen,
    employeeToWarn,
    warningReason,
    setWarningReason,
    terminationLetter,
    isEditMode,
    editFormData,
    editFormErrors,
    handleOpenRevokeModal,
    handleCloseRevokeModal,
    handleOpenWarningModal,
    handleCloseWarningModal,
    handleOpenDetailsModal,
    handleCloseDetailsModal,
    handleFileChange,
    handleStartEdit,
    handleCancelEdit,
    handleEditFormChange,
    validateEditForm
  };
} 