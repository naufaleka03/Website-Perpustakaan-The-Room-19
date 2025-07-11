"use client";

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Event types for selection
const EVENT_TYPES = [
  { id: 'meeting', label: 'Meeting', color: 'bg-blue-100 text-blue-800' },
  { id: 'task', label: 'Task', color: 'bg-green-100 text-green-800' },
  { id: 'event', label: 'Event', color: 'bg-purple-100 text-purple-800' },
];

export default function ScheduleCalendar() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState({});
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    type: 'meeting'
  });

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDateClick = (value) => {
    setSelectedDate(value);
    setShowEventModal(true);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.time) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const updatedEvents = {
      ...events,
      [dateStr]: [
        ...(events[dateStr] || []),
        {
          id: Date.now(),
          ...newEvent
        }
      ]
    };

    setEvents(updatedEvents);
    setNewEvent({ title: '', time: '', type: 'meeting' });
    setShowEventModal(false);
  };

  const handleDeleteEvent = (dateStr, eventId) => {
    const updatedEvents = {
      ...events,
      [dateStr]: events[dateStr].filter(event => event.id !== eventId)
    };
    setEvents(updatedEvents);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      if (events[dateStr]?.length > 0) {
        return (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md relative">
      <h3 className="font-semibold text-lg text-gray-800 mb-4">Schedule & Events</h3>
      <div className="calendar-container">
        <Calendar
          onChange={handleDateClick}
          value={selectedDate}
          className="w-full border-none"
          showFixedNumberOfWeeks
          tileContent={tileContent}
        />
      </div>

      {/* Add Event Modal */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Add Event for {selectedDate.toLocaleDateString()}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {EVENT_TYPES.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events List Modal */}
      {selectedDate && !showEventModal && events[selectedDate.toISOString().split('T')[0]]?.length > 0 && (
        <div className="absolute z-10 bg-white rounded-lg shadow-lg p-4 min-w-[250px]"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-800">
              Events for {selectedDate.toLocaleDateString()}
            </h4>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {events[selectedDate.toISOString().split('T')[0]].map((event) => (
              <div
                key={event.id}
                className={`p-2 rounded-md ${EVENT_TYPES.find(t => t.id === event.type)?.color} flex justify-between items-center`}
              >
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm opacity-75">{event.time}</div>
                </div>
                <button
                  onClick={() => handleDeleteEvent(selectedDate.toISOString().split('T')[0], event.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 