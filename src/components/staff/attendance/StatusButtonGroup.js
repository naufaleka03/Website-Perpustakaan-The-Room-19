import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StatusButtonGroup = ({ staff, attendanceRecords, handleOpenModal, getButtonClass }) => {
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const statusMap = { P: 'Present', A: 'Absent', L: 'Late' };
  const statusColor = { P: '#22c55e', A: '#ef4444', L: '#f59e42' };
  const submittedStatus = attendanceRecords[staff.id]?.status;
  
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