// app/page.js
"use client";

import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Data constants
const RESERVATION_DATA = {
  today: {
    labels: ['10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm'],
    data: [18, 20, 25, 23, 20, 18, 22, 28, 30, 26, 20, 15, 10],
  },
  sevenDays: {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    data: [150, 165, 170, 180, 200, 220, 190],
  },
  month: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    data: [800, 850, 950, 900],
  },
};

const STOCK_DATA = [
  { name: 'Chocolate Chip Cookies', qty: 150 },
  { name: 'Blueberry Muffins', qty: 80 },
  { name: 'Croissants', qty: 120 },
  { name: 'Red Velvet Cake', qty: 20 },
  { name: 'Cheesecake', qty: 35 },
  { name: 'Earl Grey Tea Bags', qty: 500 },
  { name: 'Green Tea Bags', qty: 450 },
  { name: 'Chamomile Tea Bags', qty: 300 },
  { name: 'Espresso Beans', qty: '50 kg' },
  { name: 'Milk', qty: '40L' },
  { name: 'Sugar Packets', qty: 1000 },
  { name: 'Brownies', qty: 90 },
];

const AVAILABLE_EVENTS = [
  { id: 1, title: 'Public Library Tour', type: 'public' },
  { id: 2, title: 'Private Staff Meeting', type: 'private' },
  { id: 3, title: 'Public Book Fair', type: 'public' },
  { id: 4, title: 'Private Board Review', type: 'private' }
];

const DUMMY_BORROWED_LIST = [
  { id: 1, name: 'Alice', book: 'Book A', date: '2024-06-01' },
  { id: 2, name: 'Bob', book: 'Book B', date: '2024-06-02' },
  { id: 3, name: 'Charlie', book: 'Book C', date: '2024-06-03' },
];

const DUMMY_LATE_LIST = [
  { id: 1, name: 'David', book: 'Book D', due: '2024-05-28', daysLate: 3 },
  { id: 2, name: 'Eve', book: 'Book E', due: '2024-05-29', daysLate: 2 },
];

// Chart configuration
const getChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { color: '#9ca3af', font: { size: 10 } },
      grid: { display: false },
      border: { display: false },
    },
    x: {
      ticks: { color: '#9ca3af', font: { size: 10 } },
      grid: { display: false },
      border: { display: false },
    },
  },
});

// Utility functions
const getActiveShift = () => {
  const hour = new Date().getHours();
  if (hour >= 10 && hour < 14) return 'A';
  if (hour >= 14 && hour < 18) return 'B';
  if (hour >= 18 && hour < 22) return 'C';
  return null;
};

const getEventDetails = (event) => ({
  address: '123 Main St, Springfield',
  time: '14:00 - 16:00',
  date: '2024-06-20',
  reservedPeople: 25,
  ...event
});

// Components
const TimeRangeSelector = ({ timeRange, onTimeRangeChange }) => (
  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
    {['today', 'sevenDays', 'month'].map((range) => (
      <button
        key={range}
        onClick={() => onTimeRangeChange(range)}
        className={`px-3 py-1 text-sm font-semibold rounded-md shadow-sm focus:outline-none ${
          timeRange === range ? 'bg-white text-gray-800' : 'text-gray-500 hover:bg-gray-200'
        }`}
      >
        {range === 'sevenDays' ? '7-days' : range.charAt(0).toUpperCase() + range.slice(1)}
      </button>
    ))}
  </div>
);

const ReservationChart = ({ timeRange }) => {
  const chartData = {
    labels: RESERVATION_DATA[timeRange].labels,
    datasets: [{
      label: 'Reservations',
      data: RESERVATION_DATA[timeRange].data,
      backgroundColor: 'rgba(96, 165, 250, 0.7)',
      borderColor: 'rgba(96, 165, 250, 1)',
      borderRadius: 8,
      borderWidth: 1,
    }],
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={getChartOptions()} />
    </div>
  );
};

const CalendarTile = ({ date, view, assignedEvents, onDateSelect, hoveredDate, setHoveredDate }) => {
  if (view !== 'month') return null;
  
  const dateStr = date.toISOString().split('T')[0];
  const events = assignedEvents[dateStr] || [];
  
  if (events.length === 0) return null;

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHoveredDate(dateStr)}
      onMouseLeave={() => setHoveredDate(null)}
    >
      <div className="flex space-x-0.5 mb-0.5 mt-1">
        {events.map((event, idx) => (
          <div
            key={idx}
            className={`w-1.5 h-1.5 rounded-full ${
              event.type === 'public' ? 'bg-green-500' : 'bg-purple-500'
            }`}
          />
        ))}
      </div>
      
      {hoveredDate === dateStr && (
        <div className="pointer-events-none absolute z-30 left-1/2 -translate-x-1/2 -top-2 -translate-y-full w-max max-w-xs">
          <div className="pointer-events-auto bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[220px] text-xs text-gray-800 whitespace-normal">
            <div className="font-semibold mb-1">Event Details</div>
            {events.map((event, idx) => {
              const details = getEventDetails(event);
              return (
                <div key={idx} className="mb-2 last:mb-0 p-2 rounded-md" 
                     style={{ background: event.type === 'public' ? '#bbf7d0' : '#e9d5ff' }}>
                  <div><span className="font-medium">Title:</span> {details.title}</div>
                  <div><span className="font-medium">Address:</span> {details.address}</div>
                  <div><span className="font-medium">Time:</span> {details.time}</div>
                  <div><span className="font-medium">Date:</span> {details.date}</div>
                  <div><span className="font-medium">Reserved People:</span> {details.reservedPeople}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const EventAssignmentModal = ({ selectedDate, assignedEvents, onClose, onAssignEvent, onRemoveEvent }) => {
  if (!selectedDate) return null;
  
  const dateStr = selectedDate.toISOString().split('T')[0];
  const currentEvents = assignedEvents[dateStr] || [];

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="absolute z-10 bg-white rounded-lg shadow-xl p-4 min-w-[300px]"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-800">
            Assign Event for {selectedDate.toLocaleDateString()}
          </h4>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {currentEvents.length > 0 && (
          <motion.div className="mb-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Assigned Events:</h5>
            <div className="space-y-2">
              {currentEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  className={`p-2 rounded-md ${
                    event.type === 'public' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                  } flex justify-between items-center`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                >
                  <span className="font-medium">{event.title}</span>
                  <button
                    onClick={() => onRemoveEvent(dateStr, event.id)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Available Events:</h5>
          <div className="space-y-2">
            {AVAILABLE_EVENTS.map((event, index) => (
              <motion.button
                key={event.id}
                onClick={() => onAssignEvent(event)}
                className={`w-full p-2 rounded-md text-left transition-all duration-200 ${
                  event.type === 'public' ? 'bg-green-50 hover:bg-green-100 text-green-800' : 'bg-purple-50 hover:bg-purple-100 text-purple-800'
                }`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {event.title}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// StaffCard with hover animation for 'See Evidence'
const StaffCard = ({ staff, index, onSeeEvidence }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col justify-center items-center relative cursor-pointer transition-shadow duration-200 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ minHeight: 80 }}
    >
      {staff ? (
        <>
          <p className="font-semibold text-gray-800">{staff.name}</p>
          <p className="text-sm text-gray-500">{staff.department}</p>
        </>
      ) : (
        <p className="text-gray-500">{index === 0 ? 'No staff on duty' : '-'}</p>
      )}
      <AnimatePresence>
        {isHovered && staff && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg z-10"
            onClick={() => onSeeEvidence && onSeeEvidence(staff)}
            style={{ cursor: 'pointer' }}
          >
            <span className="text-white font-semibold text-base">See Evidence</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BorrowingActivityCard = ({ count, label, onClick, isHovered, onHoverChange }) => (
  <motion.div 
    onClick={onClick}
    className="cursor-pointer relative group"
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.2 }}
    onMouseEnter={() => onHoverChange(true)}
    onMouseLeave={() => onHoverChange(false)}
  >
    <div className="flex items-center justify-center space-x-2">
      <p className="text-6xl font-bold text-gray-800">{count}</p>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute -right-8 top-1/3 transform -translate-y-1/2"
          >
            <FaSearch className="text-blue-500 text-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    <p className="text-lg text-gray-500 mt-2">{label}</p>
  </motion.div>
);

const BorrowingModal = ({ isOpen, type, onClose }) => {
  if (!isOpen) return null;

  const data = type === 'borrowed' ? DUMMY_BORROWED_LIST : DUMMY_LATE_LIST;
  const columns = type === 'borrowed' 
    ? ['#', 'Name', 'Book', 'Date']
    : ['#', 'Name', 'Book', 'Due', 'Days Late'];

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex flex-col relative p-8"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6">{type === 'borrowed' ? 'Borrowing List' : 'Late List'}</h2>
        <div className="flex-1 w-full overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {columns.map((col) => (
                  <th key={col} className="p-3 text-sm font-semibold text-gray-800 border-b border-gray-200">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                  <td className="p-3 text-sm text-gray-700 font-medium">{item.id}</td>
                  <td className="p-3 text-sm text-gray-700 font-medium">{item.name}</td>
                  <td className="p-3 text-sm text-gray-700">{item.book}</td>
                  <td className="p-3 text-sm text-gray-700">{type === 'borrowed' ? item.date : item.due}</td>
                  {type === 'late' && <td className="p-3 text-sm text-gray-700 font-medium">{item.daysLate}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main component
export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('today');
  const [mounted, setMounted] = useState(false);
  const [date, setDate] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [currentStaff, setCurrentStaff] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [borrowingModalOpen, setBorrowingModalOpen] = useState(false);
  const [borrowingModalType, setBorrowingModalType] = useState('borrowed');
  const [isBorrowedHovered, setIsBorrowedHovered] = useState(false);
  const [isLateHovered, setIsLateHovered] = useState(false);
  const [assignedEvents, setAssignedEvents] = useState({
    '2024-03-20': [
      { id: 1, title: 'Public Library Tour', type: 'public' },
      { id: 2, title: 'Private Staff Meeting', type: 'private' }
    ],
    '2024-03-21': [
      { id: 3, title: 'Public Book Fair', type: 'public' }
    ]
  });

  // Evidence modal state
  const [evidenceModal, setEvidenceModal] = useState({ open: false, image: null, staffName: '', loading: false, error: '' });

  // Handler to fetch and show evidence for a staff
  const handleSeeEvidence = async (staff) => {
    if (!staff || !staff.name) return;
    setEvidenceModal({ open: true, image: null, staffName: staff.name, loading: true, error: '' });
    try {
      // Fetch the latest attendance record for this staff by name
      const res = await fetch(`/api/staff/attendance/records?staff_name=${encodeURIComponent(staff.name)}&limit=1&order=desc`);
      const data = await res.json();
      if (res.ok && data.records && data.records.length > 0) {
        const record = data.records[0];
        if (record.evidence_url) {
          setEvidenceModal({ open: true, image: record.evidence_url, staffName: staff.name, loading: false, error: '' });
        } else {
          setEvidenceModal({ open: true, image: null, staffName: staff.name, loading: false, error: `${staff.name} hasn't uploaded evidence yet.` });
        }
      } else {
        setEvidenceModal({ open: true, image: null, staffName: staff.name, loading: false, error: `${staff.name} hasn't uploaded evidence yet.` });
      }
    } catch (err) {
      setEvidenceModal({ open: true, image: null, staffName: staff.name, loading: false, error: 'Failed to fetch evidence.' });
    }
  };

  // Event handlers
  const handleAssignEvent = (event) => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    setAssignedEvents(prev => ({
      ...prev,
      [dateStr]: [...(prev[dateStr] || []), event]
    }));
    setSelectedDate(null);
  };

  const handleRemoveEvent = (dateStr, eventId) => {
    setAssignedEvents(prev => ({
      ...prev,
      [dateStr]: prev[dateStr].filter(e => e.id !== eventId)
    }));
  };

  const handleBorrowingModalOpen = (type) => {
    setBorrowingModalType(type);
    setBorrowingModalOpen(true);
  };

  // Effects
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees');
        const data = await response.json();
        setAllEmployees(response.ok && data.employees ? data.employees : []);
      } catch (error) {
        setAllEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const activeShift = getActiveShift();
    if (activeShift) {
      const activeStaff = allEmployees
        .filter(staff => staff.shift === activeShift)
        .sort((a, b) => a.name.localeCompare(b.name));
      setCurrentStaff(activeStaff.slice(0, 4));
    } else {
      setCurrentStaff([]);
    }
  }, [allEmployees]);

  useEffect(() => {
    setMounted(true);
    setDate(new Date());
  }, []);

  const tileContent = ({ date, view }) => (
    <CalendarTile
      date={date}
      view={view}
      assignedEvents={assignedEvents}
      onDateSelect={setSelectedDate}
      hoveredDate={hoveredDate}
      setHoveredDate={setHoveredDate}
    />
  );

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full min-h-[calc(100vh-12rem)]">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
      <hr className="border-gray-300" />
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Reservation Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-800">Reservation Overview</h3>
            <TimeRangeSelector timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          </div>
          <ReservationChart timeRange={timeRange} />
        </div>

        {/* Schedule & Events */}
        <div className="bg-white p-6 rounded-xl shadow-md relative">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Schedule & Events</h3>
          {mounted && date && (
            <Calendar
              onChange={setSelectedDate}
              value={date}
              className="w-full border-none"
              showFixedNumberOfWeeks
              tileContent={tileContent}
            />
          )}
        </div>

        {/* Stock Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md aspect-square flex flex-col">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Stock Overview</h3>
          <div className="overflow-y-auto flex-grow">
            <ul className="space-y-2">
              {STOCK_DATA.map((item, index) => (
                <li key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-semibold text-gray-800">{item.qty}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Today's Staff */}
        <div className="bg-white p-6 rounded-2xl shadow-md lg:col-span-2 flex flex-col">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Today's Staff</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
            {mounted ? (
              Array.from({ length: 4 }, (_, i) => (
                <StaffCard key={i} staff={currentStaff[i]} index={i} onSeeEvidence={handleSeeEvidence} />
              ))
            ) : (
              Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col justify-center items-center">
                  <p className="text-gray-500">Loading...</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Borrowing Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2 flex flex-col">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Borrowing Activity</h3>
          <div className="flex-grow flex justify-around items-center text-center">
            <BorrowingActivityCard
              count={38}
              label="Borrowed"
              onClick={() => handleBorrowingModalOpen('borrowed')}
              isHovered={isBorrowedHovered}
              onHoverChange={setIsBorrowedHovered}
            />
            <BorrowingActivityCard
              count={0}
              label="Late"
              onClick={() => handleBorrowingModalOpen('late')}
              isHovered={isLateHovered}
              onHoverChange={setIsLateHovered}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedDate && (
          <EventAssignmentModal
            selectedDate={selectedDate}
            assignedEvents={assignedEvents}
            onClose={() => setSelectedDate(null)}
            onAssignEvent={handleAssignEvent}
            onRemoveEvent={handleRemoveEvent}
          />
        )}
        
        <BorrowingModal
          isOpen={borrowingModalOpen}
          type={borrowingModalType}
          onClose={() => setBorrowingModalOpen(false)}
        />
      </AnimatePresence>

      {/* Evidence Modal for StaffCard */}
      {evidenceModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-4">Evidence for {evidenceModal.staffName}</h2>
            {evidenceModal.loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : evidenceModal.image ? (
              <img src={evidenceModal.image} alt="Evidence" className="max-w-full max-h-96 rounded border mb-4" />
            ) : (
              <div className="text-red-500 font-medium mb-4">{evidenceModal.error}</div>
            )}
            <button
              onClick={() => setEvidenceModal({ open: false, image: null, staffName: '', loading: false, error: '' })}
              className="px-4 py-2 rounded bg-sky-500 text-white hover:bg-sky-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Calendar styles
const customCalendarStyles = `
  .react-calendar {
    border-radius: 0.75rem;
    font-family: inherit;
    background: white;
    border: 1px solid #e5e7eb;
  }
  .react-calendar__tile {
    background: white;
    color: #374151;
    position: relative;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .react-calendar__tile:hover {
    background: #f3f4f6;
  }
  .react-calendar__tile--active {
    background-color: #4a90e2 !important;
    color: white !important;
    border-radius: 50% !important;
  }
  .react-calendar__tile--now {
    background-color: #60a5fa !important;
    color: white !important;
    border-radius: 50% !important;
    font-weight: bold;
  }
  .react-calendar__tile--now .react-calendar__tile__content {
    background-color: #60a5fa !important;
    color: white !important;
    border-radius: 50% !important;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .react-calendar__navigation button {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    background: white;
  }
  .react-calendar__navigation button:hover {
    background: #f3f4f6;
  }
  .react-calendar__month-view__weekdays__weekday {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    color: #6b7280;
  }
  .react-calendar__month-view__days__day {
    color: #374151;
  }
  .react-calendar__month-view__days__day--weekend {
    color: #dc2626 !important;
  }
  .react-calendar__month-view__days__day--neighboringMonth {
    color: #9ca3af !important;
  }
  .react-calendar__tile--now.react-calendar__month-view__days__day--weekend {
    color: white !important;
  }
`;

if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = customCalendarStyles;
  document.head.appendChild(styleSheet);
}