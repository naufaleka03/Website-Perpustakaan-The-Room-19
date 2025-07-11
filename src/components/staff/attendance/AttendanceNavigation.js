import React from 'react';
import { IoTimeOutline, IoCalendarOutline } from "react-icons/io5";

const AttendanceNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'attendance',
      label: 'Attendance',
      icon: IoTimeOutline,
      description: 'Mark staff attendance'
    },
    {
      id: 'history',
      label: 'History',
      icon: IoCalendarOutline,
      description: 'View attendance records'
    }
  ];

  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                  isActive
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Active tab description */}
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>
    </div>
  );
};

export default AttendanceNavigation; 