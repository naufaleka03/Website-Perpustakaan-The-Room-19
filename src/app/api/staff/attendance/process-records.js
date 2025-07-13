/**
 * Utility functions for processing attendance records
 * Moved from frontend component to API layer
 */

/**
 * Process raw attendance records into a structured format
 * @param {Array} records - Raw attendance records from database
 * @returns {Object} Processed attendance records map
 */
export function processAttendanceRecords(records) {
  const recordsMap = {};
  
  // Support multiple records per staff per day (for different statuses)
  records.forEach(record => {
    if (!recordsMap[record.staff_id]) {
      recordsMap[record.staff_id] = { statuses: [] };
    }
    recordsMap[record.staff_id].statuses.push(record.status);
    // Save the latest timestamp for each status
    recordsMap[record.staff_id][record.status] = record.timestamp;
  });
  
  // For convenience, set .status to the latest of P, A, L, CO, ECO if present
  Object.keys(recordsMap).forEach(staffId => {
    const s = recordsMap[staffId].statuses;
    if (s.includes('CO')) recordsMap[staffId].status = 'CO';
    else if (s.includes('ECO')) recordsMap[staffId].status = 'ECO';
    else if (s.includes('P')) recordsMap[staffId].status = 'P';
    else if (s.includes('L')) recordsMap[staffId].status = 'L';
    else if (s.includes('A')) recordsMap[staffId].status = 'A';
    
    // Early checkout info
    if (s.includes('ECO')) {
      recordsMap[staffId].earlyCheckout = {
        status: 'ECO',
        timestamp: recordsMap[staffId]['ECO']
      };
    } else if (s.includes('CO')) {
      recordsMap[staffId].earlyCheckout = {
        status: 'CO',
        timestamp: recordsMap[staffId]['CO']
      };
    }
  });
  
  return recordsMap;
}

/**
 * Filter staff by active status and search query
 * @param {Array} staff - All staff members
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered staff members
 */
export function filterActiveStaff(staff, searchQuery = '') {
  return staff.filter(staffMember =>
    staffMember.status === 'Active' && 
    staffMember.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}

/**
 * Get current staff for active shift
 * @param {Array} allStaff - All staff members
 * @param {number} hour - Current hour (0-23)
 * @returns {Array} Staff for current shift
 */
export function getCurrentShiftStaff(allStaff, hour = new Date().getHours()) {
  const activeShift = getActiveShift(hour);
  if (!activeShift) return [];
  
  return allStaff.filter(staff => 
    staff.status === 'Active' && staff.shift === activeShift
  ).sort((a, b) => a.name.localeCompare(b.name));
}

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
 * Get button class based on attendance status
 * @param {Object} attendanceRecords - Processed attendance records
 * @param {string} staffNo - Staff ID
 * @param {string} status - Status to check
 * @param {string} baseClass - Base CSS class
 * @returns {string} CSS class string
 */
export function getButtonClass(attendanceRecords, staffNo, status, baseClass) {
  const currentRecord = attendanceRecords[staffNo];
  if (currentRecord) {
    if (currentRecord.earlyCheckout) return `${baseClass} bg-gray-300 text-gray-800`;
    if (currentRecord.status === status) {
      const colors = {
        P: 'bg-green-500 text-white',
        A: 'bg-red-500 text-white',
        L: 'bg-orange-500 text-white'
      };
      return `${baseClass} ${colors[status]}`;
    }
    return `${baseClass} bg-gray-200 text-gray-400 cursor-not-allowed`;
  }
  return `${baseClass} bg-gray-300 text-gray-800`;
}

/**
 * Check if staff has Non-Active status for debugging
 * @param {Array} staff - Staff array
 * @returns {Array} Non-Active staff members
 */
export function getNonActiveStaff(staff) {
  return staff.filter(s => s.status !== 'Active');
}

/**
 * Format shift time for display
 * @param {string} shift - Shift letter (A, B, C)
 * @returns {string} Formatted shift time string
 */
export function formatShiftTime(shift) {
  const shiftInfo = {
    A: { name: 'Shift A', startTime: '10:00', endTime: '14:00' },
    B: { name: 'Shift B', startTime: '14:01', endTime: '18:00' },
    C: { name: 'Shift C', startTime: '18:01', endTime: '22:00' }
  };
  
  const info = shiftInfo[shift];
  if (!info) return 'Unknown Shift';
  
  return `${info.name} (${info.startTime} - ${info.endTime})`;
} 