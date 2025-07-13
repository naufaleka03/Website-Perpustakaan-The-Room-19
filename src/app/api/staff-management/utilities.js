/**
 * Utility functions for staff management
 * Moved from frontend employee page to API layer
 */

/**
 * Format date for display
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time for display
 * @param {string} timeString - Time string to format
 * @returns {string} - Formatted time string
 */
export function formatTime(timeString) {
  if (!timeString) return '-';
  
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format timestamp for display
 * @param {string} timestamp - Timestamp to format
 * @returns {Object} - Object with formatted date and time
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return { date: '-', time: '-' };
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return { date: '-', time: '-' };
  
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  return { date: dateStr, time: timeStr };
}

/**
 * Get status badge color class
 * @param {string} status - Status code
 * @returns {string} - CSS class for status badge
 */
export function getStatusBadgeColor(status) {
  const colors = {
    P: 'bg-green-100 text-green-800',
    A: 'bg-red-100 text-red-800',
    L: 'bg-orange-100 text-orange-800',
    CO: 'bg-blue-100 text-blue-800',
    EC: 'bg-yellow-100 text-yellow-800',
    ECO: 'bg-purple-100 text-purple-800'
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Validate employee data
 * @param {Object} data - Employee data to validate
 * @returns {Object} - Validation result with errors array
 */
export function validateEmployeeData(data) {
  const errors = [];
  
  if (!data.fullName?.trim()) {
    errors.push('Full name is required');
  }
  
  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }
  
  if (!data.phone?.trim()) {
    errors.push('Phone number is required');
  }
  
  if (!data.gender) {
    errors.push('Gender is required');
  }
  
  if (!data.department?.trim()) {
    errors.push('Department is required');
  }
  
  if (!data.shift) {
    errors.push('Shift is required');
  }
  
  if (data.age && (isNaN(data.age) || data.age < 18 || data.age > 65)) {
    errors.push('Age must be between 18 and 65');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate employee ID
 * @returns {string} - Generated employee ID
 */
export function generateEmployeeId() {
  return `EMP${Date.now()}`;
}

/**
 * Generate temporary password
 * @returns {string} - Generated temporary password
 */
export function generateTempPassword() {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
} 