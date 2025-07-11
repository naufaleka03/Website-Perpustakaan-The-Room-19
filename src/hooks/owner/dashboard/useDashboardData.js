"use client";

import { useState, useEffect, useMemo } from 'react';

const defaultEmployeesData = [
  { no: 1, name: 'Penny Traiton', department: 'Staff', shift: 'A', hireDate: '2022-08-29', gender: 'M', status: 'Active', age: 28, address: '123 Maple St, Springfield', phone: '+1-202-555-0104', email: 'penny.t@example.com' },
  { no: 2, name: 'Anna Bors', department: 'Librarian', shift: 'B', hireDate: '2021-02-21', gender: 'F', status: 'Non-Active', age: 34, address: '456 Oak Ave, Shelbyville', phone: '+1-202-555-0157', email: 'anna.b@example.com' },
  { no: 3, name: 'John Smith', department: 'Staff', shift: 'A', hireDate: '2023-01-15', gender: 'M', status: 'Active', age: 25, address: '789 Pine Ln, Capital City', phone: '+1-202-555-0162', email: 'john.s@example.com' },
  { no: 4, name: 'Alice Johnson', department: 'Librarian', shift: 'C', hireDate: '2022-05-10', gender: 'F', status: 'Active', age: 31, address: '101 Elm Rd, Ogdenville', phone: '+1-202-555-0188', email: 'alice.j@example.com' },
  { no: 5, name: 'Bob Williams', department: 'Maintenance', shift: 'A', hireDate: '2023-03-01', gender: 'M', status: 'Non-Active', age: 45, address: '212 Birch Blvd, North Haverbrook', phone: '+1-202-555-0199', email: 'bob.w@example.com' },
  { no: 6, name: 'Eva Brown', department: 'Staff', shift: 'B', hireDate: '2021-11-20', gender: 'F', status: 'Active', age: 29, address: '333 Cedar Ct, Brockway', phone: '+1-202-555-0143', email: 'eva.b@example.com' },
  { no: 7, name: 'Michael Davis', department: 'Security', shift: 'C', hireDate: '2023-07-01', gender: 'M', status: 'Active', age: 38, address: '444 Spruce Way, Lanley', phone: '+1-202-555-0177', email: 'michael.d@example.com' },
];

const reservationData = {
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

const stockData = [
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

export function useDashboardData() {
  const [timeRange, setTimeRange] = useState('today');
  const [date, setDate] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  // Memoize current staff calculation
  const currentStaff = useMemo(() => {
    if (!isClient) return [];

    const now = new Date();
    const currentHour = now.getHours();

    let activeShift = null;
    if (currentHour >= 9 && currentHour < 15) {
      activeShift = 'A';
    } else if (currentHour >= 15 && currentHour < 21) {
      activeShift = 'B';
    }

    if (!activeShift) return [];

    return defaultEmployeesData
      .filter(staff => staff.shift === activeShift)
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 2);
  }, [isClient]);

  // Memoize reservation data for current time range
  const currentReservationData = useMemo(() => {
    return reservationData[timeRange] || reservationData.today;
  }, [timeRange]);

  // Memoize stock data with low stock items
  const stockDataWithStatus = useMemo(() => {
    return stockData.map(item => ({
      ...item,
      isLowStock: typeof item.qty === 'number' ? item.qty < 50 : false
    }));
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return {
    timeRange,
    setTimeRange,
    date,
    setDate,
    currentStaff,
    isClient,
    reservationData: currentReservationData,
    stockData: stockDataWithStatus
  };
} 