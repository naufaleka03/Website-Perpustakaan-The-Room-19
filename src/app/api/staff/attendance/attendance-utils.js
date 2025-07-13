/**
 * Business logic utilities for attendance system
 * Moved from frontend utils.js to API layer
 */

// Utility constants and functions for staff attendance
export const STATUS_MAP = {
  P: 'Present',
  A: 'Absent',
  L: 'Late',
  CO: 'Clock-out',
  ECO: 'Early Clock-out',
  EC: 'Early Clock-out',
};

export const STATUS_COLOR = {
  P: '#22c55e',
  A: '#ef4444',
  L: '#f59e42',
};

// Shift definitions with correct time ranges
export const SHIFT_SCHEDULES = {
  A: {
    name: 'Shift A',
    startTime: '10:00',
    endTime: '14:00',
    startHour: 10,
    endHour: 14,
    description: 'Morning Shift (10:00 - 14:00)'
  },
  B: {
    name: 'Shift B', 
    startTime: '14:01',
    endTime: '18:00',
    startHour: 14,
    endHour: 18,
    description: 'Afternoon Shift (14:01 - 18:00)'
  },
  C: {
    name: 'Shift C',
    startTime: '18:01', 
    endTime: '22:00',
    startHour: 18,
    endHour: 22,
    description: 'Evening Shift (18:01 - 22:00)'
  }
};

/**
 * Get the currently active shift based on current time
 * @param {number} hour - Current hour (0-23)
 * @returns {string|null} - Active shift letter (A, B, C) or null if outside shift hours
 */
export function getActiveShift(hour = new Date().getHours()) {
  if (hour >= 10 && hour < 14) return 'A';
  if (hour >= 14 && hour < 18) return 'B';
  if (hour >= 18 && hour < 22) return 'C';
  return null;
}

/**
 * Check if a staff member is currently in their assigned shift
 * @param {Object} staff - Staff object with shift property
 * @param {number} hour - Current hour (0-23)
 * @returns {boolean} - True if staff is in their shift hours
 */
export function isStaffInShift(staff, hour = new Date().getHours()) {
  if (!staff || !staff.shift) return false;
  
  const shift = SHIFT_SCHEDULES[staff.shift];
  if (!shift) return false;
  
  return hour >= shift.startHour && hour < shift.endHour;
}

/**
 * Get the next shift for a staff member
 * @param {string} currentShift - Current shift letter (A, B, C)
 * @returns {string|null} - Next shift letter or null if no next shift
 */
export function getNextShift(currentShift) {
  const shiftOrder = ['A', 'B', 'C'];
  const currentIndex = shiftOrder.indexOf(currentShift);
  if (currentIndex === -1) return null;
  
  const nextIndex = (currentIndex + 1) % shiftOrder.length;
  return shiftOrder[nextIndex];
}

/**
 * Get the previous shift for a staff member
 * @param {string} currentShift - Current shift letter (A, B, C)
 * @returns {string|null} - Previous shift letter or null if no previous shift
 */
export function getPreviousShift(currentShift) {
  const shiftOrder = ['A', 'B', 'C'];
  const currentIndex = shiftOrder.indexOf(currentShift);
  if (currentIndex === -1) return null;
  
  const prevIndex = currentIndex === 0 ? shiftOrder.length - 1 : currentIndex - 1;
  return shiftOrder[prevIndex];
}

/**
 * Check if staff can perform early checkout based on shift and attendance status
 * @param {Object} staff - Staff object with shift property
 * @param {Object} attendanceRecords - Current attendance records
 * @param {number} hour - Current hour (0-23)
 * @returns {boolean} - True if early checkout is allowed
 */
export function canEarlyCheckout(staff, attendanceRecords, hour = new Date().getHours()) {
  // Check if staff is within their shift hours
  const isInShift = isStaffInShift(staff, hour);
  
  // Check if staff has already checked in (P, L, or A status)
  const hasCheckedIn = attendanceRecords[staff.id] && ['P', 'L', 'A'].includes(attendanceRecords[staff.id].status);
  
  // Check if staff hasn't already clocked out early
  const hasNotCheckedOutEarly = !attendanceRecords[staff.id]?.earlyCheckout;
  
  return isInShift && hasCheckedIn && hasNotCheckedOutEarly;
}

/**
 * Get staff members who should be active for a specific shift
 * @param {Array} allStaff - Array of all staff members
 * @param {string} shift - Shift letter (A, B, C)
 * @returns {Array} - Array of staff members assigned to the shift
 */
export function getStaffForShift(allStaff, shift) {
  if (!allStaff || !Array.isArray(allStaff)) return [];
  
  return allStaff.filter(staff => 
    staff.status === 'Active' && staff.shift === shift
  );
}

/**
 * Get all active staff for the current shift
 * @param {Array} allStaff - Array of all staff members
 * @param {number} hour - Current hour (0-23)
 * @returns {Array} - Array of active staff for current shift
 */
export function getActiveStaffForCurrentShift(allStaff, hour = new Date().getHours()) {
  const activeShift = getActiveShift(hour);
  if (!activeShift) return [];
  
  return getStaffForShift(allStaff, activeShift);
}

/**
 * Check if a timestamp is within a staff member's shift hours
 * @param {Object} staff - Staff object with shift property
 * @param {Date|string} timestamp - Timestamp to check
 * @returns {boolean} - True if timestamp is within shift hours
 */
export function isTimestampInShift(staff, timestamp) {
  if (!staff || !staff.shift) return false;
  
  const date = new Date(timestamp);
  const hour = date.getHours();
  
  return isStaffInShift(staff, hour);
}

/**
 * Get shift information for display purposes
 * @param {string} shift - Shift letter (A, B, C)
 * @returns {Object|null} - Shift information object or null if invalid
 */
export function getShiftInfo(shift) {
  return SHIFT_SCHEDULES[shift] || null;
}

/**
 * Format shift time for display
 * @param {string} shift - Shift letter (A, B, C)
 * @returns {string} - Formatted shift time string
 */
export function formatShiftTime(shift) {
  const shiftInfo = getShiftInfo(shift);
  if (!shiftInfo) return 'Unknown Shift';
  
  return `${shiftInfo.name} (${shiftInfo.startTime} - ${shiftInfo.endTime})`;
}

// Check if clock-out should be disabled (15 minutes before shift ends)
export const isClockOutDisabled = (shift) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const shiftEndTimes = {
    'A': 14 * 60, // 14:00
    'B': 18 * 60, // 18:00
    'C': 22 * 60  // 22:00
  };
  
  const shiftEndTime = shiftEndTimes[shift];
  const timeUntilEnd = shiftEndTime - currentTime;
  
  // Clock-Out is only enabled when it's 15 minutes or less before shift ends
  return timeUntilEnd > 15;
};

// Check if early clock-out should be disabled (15 minutes before shift ends)
export const isEarlyClockOutDisabled = (shift) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const shiftEndTimes = {
    'A': 14 * 60, // 14:00
    'B': 18 * 60, // 18:00
    'C': 22 * 60  // 22:00
  };
  
  const shiftEndTime = shiftEndTimes[shift];
  const timeUntilEnd = shiftEndTime - currentTime;
  
  // Early Clock-Out is disabled when it's 15 minutes or less before shift ends
  return timeUntilEnd <= 15;
}; 