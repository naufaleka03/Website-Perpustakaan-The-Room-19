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

export function getActiveShift(hour = new Date().getHours()) {
  if (hour >= 9 && hour < 13) return 'A';
  if (hour >= 13 && hour < 17) return 'B';
  if (hour >= 17 && hour < 21) return 'C';
  return null;
}

export function canEarlyCheckout(staff, attendanceRecords, hour = new Date().getHours()) {
  // Check if staff is within their shift hours
  const isInShift = (
    (staff.shift === 'A' && hour >= 9 && hour < 13) ||
    (staff.shift === 'B' && hour >= 13 && hour < 17) ||
    (staff.shift === 'C' && hour >= 17 && hour < 21)
  );
  // Check if staff has already checked in (P, L, or A status)
  const hasCheckedIn = attendanceRecords[staff.id] && ['P', 'L', 'A'].includes(attendanceRecords[staff.id].status);
  // Check if staff hasn't already clocked out early
  const hasNotCheckedOutEarly = !attendanceRecords[staff.id]?.earlyCheckout;
  return isInShift && hasCheckedIn && hasNotCheckedOutEarly;
} 