import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isClockOutDisabled, isEarlyClockOutDisabled } from '@/app/api/staff/attendance/attendance-utils';

const StatusButtonGroup = ({ 
  staff, 
  attendanceRecords, 
  handleOpenModal, 
  getButtonClass, 
  currentDateTime = new Date() 
}) => {
  const [hoveredStatus, setHoveredStatus] = useState(null);


  
  const statusMap = { P: 'Present', A: 'Absent', L: 'Late' };
  const statusColor = { P: '#22c55e', A: '#ef4444', L: '#f59e42' };
  const submittedStatus = attendanceRecords[staff.id]?.status;
  const hasCheckedIn = submittedStatus && ['P', 'A', 'L'].includes(submittedStatus);
  const hasCheckedOut = attendanceRecords[staff.id]?.earlyCheckout;
  const isAbsent = submittedStatus === 'A';

  // Check if buttons should be disabled
  const clockOutDisabled = isClockOutDisabled(staff.shift);
  const earlyClockOutDisabled = isEarlyClockOutDisabled(staff.shift);

  // If staff has checked in but not checked out, show Clock-Out buttons
  // But don't show clock-out buttons for absent staff
  if (hasCheckedIn && !hasCheckedOut && !isAbsent) {
    return (
      <div className="flex flex-col space-y-2 w-full">
        <div className="flex justify-center space-x-2 relative w-full">
          <button
            onClick={() => handleOpenModal(staff, 'CO', 'Clock-Out')}
            disabled={clockOutDisabled}
            className={`font-medium py-2 px-4 rounded text-sm transition-colors duration-200 flex-1 ${
              clockOutDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            title={clockOutDisabled ? 'Clock-out disabled 15 minutes before shift end' : 'Regular clock-out'}
          >
            Clock-Out
          </button>
          
          <button
            onClick={() => handleOpenModal(staff, 'ECO', 'Early Clock-Out')}
            disabled={earlyClockOutDisabled}
            className={`font-medium py-2 px-4 rounded text-sm transition-colors duration-200 flex-1 ${
              earlyClockOutDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
            title={earlyClockOutDisabled ? 'Early clock-out disabled 15 minutes before shift end' : 'Early clock-out (available anytime during shift)'}
          >
            Early Clock-Out
          </button>
        </div>
      </div>
    );
  }

  // If staff has checked out, show status
  if (hasCheckedOut) {
    const checkoutStatus = attendanceRecords[staff.id].earlyCheckout.status;
    const statusText = checkoutStatus === 'CO' ? 'Clock-Out' : 'Early Clock-Out';
    const statusColor = checkoutStatus === 'CO' ? 'bg-blue-500' : 'bg-yellow-500';
    
    return (
      <div className="flex justify-center w-full">
        <div className={`${statusColor} text-white font-medium py-2 px-4 rounded text-sm`}>
          {statusText}
        </div>
      </div>
    );
  }
  
  // Default: Show P, A, L buttons
  return (
    <div className="flex justify-center space-x-2 relative w-full h-10">
      {['P', 'A', 'L'].map((status) => {
        const isHovered = hoveredStatus === status;
        const isSubmitted = submittedStatus === status;
        const shouldExpand = isSubmitted || (!submittedStatus && isHovered);
        const shouldColor = isSubmitted || (!submittedStatus && isHovered);
        
        return (
          <motion.button
            key={status}
            layout
            onClick={() => !submittedStatus && handleOpenModal(staff, status)}
            className={getButtonClass(staff.id, status, 'font-bold py-1 px-4 rounded text-md relative z-10')}
            disabled={!!submittedStatus && !isSubmitted}
            onMouseEnter={() => !submittedStatus && setHoveredStatus(status)}
            onMouseLeave={() => !submittedStatus && setHoveredStatus(null)}
            style={{
              flex: shouldExpand ? 3 : 1,
              transition: 'flex 0.25s ease-in-out, background-color 0.25s linear, color 0.25s linear',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              cursor: submittedStatus && !isSubmitted ? 'not-allowed' : undefined,
            }}
            animate={{
              flex: shouldExpand ? 3 : 1,
              backgroundColor: shouldColor ? statusColor[status] : undefined,
              color: shouldColor ? '#fff' : undefined,
            }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <AnimatePresence initial={false}>
              {shouldExpand ? (
                <motion.span
                  key={statusMap[status]}
                  layoutId={`status-label-${staff.id}-${status}`}
                  layout
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ display: 'inline-block', minWidth: 60, textAlign: 'center' }}
                >
                  {statusMap[status]}
                </motion.span>
              ) : (
                <motion.span
                  key={status}
                  layoutId={`status-label-${staff.id}-${status}`}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ display: 'inline-block', minWidth: 20, textAlign: 'center' }}
                >
                  {status}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}




    </div>
  );
};

export default StatusButtonGroup; 