'use client';

import { useState, useEffect, useRef } from 'react';

const WarningPopup = ({ staff, onDismiss, onAddEvidence }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (action) => {
    setShow(false);
    // Wait for animation to finish before calling parent handler
    setTimeout(() => action(staff.no), 300);
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-lg w-64 ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <p className="font-bold">Evidence Required</p>
      <p>Please add evidence for {staff.name}'s attendance.</p>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => handleAction(onAddEvidence)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-sm"
        >
          Add Evidence
        </button>
        <button
          onClick={() => handleAction(onDismiss)}
          className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-1 px-3 rounded text-sm"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
WarningPopup.displayName = 'WarningPopup';

export default function Page() {
  const [currentStaff, setCurrentStaff] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const timerRefs = useRef({});

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format date and time
  const formatDateTime = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const timeOptions = { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    };
    
    const formattedDate = date.toLocaleDateString('en-US', options);
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    
    return `${formattedDate}. Time: ${formattedTime}`;
  };

  useEffect(() => {
    const defaultEmployeesData = [
      { no: 1, name: 'Penny Traiton', department: 'Staff', shift: 'A' },
      { no: 2, name: 'Anna Bors', department: 'Librarian', shift: 'B' },
      { no: 3, name: 'John Smith', department: 'Staff', shift: 'A' },
      { no: 4, name: 'Alice Johnson', department: 'Librarian', shift: 'C' },
      { no: 5, name: 'Bob Williams', department: 'Maintenance', shift: 'A' },
      { no: 6, name: 'Eva Brown', department: 'Staff', shift: 'B' },
      { no: 7, name: 'Michael Davis', department: 'Security', shift: 'C' },
    ];
    
    const now = new Date();
    const currentHour = now.getHours();

    let activeShift = null;
    if (currentHour >= 9 && currentHour < 13) {
      activeShift = 'A';
    } else if (currentHour >= 13 && currentHour < 17) {
      activeShift = 'B';
    } else if (currentHour >= 17 && currentHour < 21) {
      activeShift = 'C';
    }

    if (activeShift) {
      const activeStaff = defaultEmployeesData
        .filter(staff => staff.shift === activeShift)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(staff => ({ ...staff, isPresent: false, showWarning: false, evidenceAdded: false }));
      
      setCurrentStaff(activeStaff.slice(0, 2));
    }
  }, []);

  useEffect(() => {
    currentStaff.forEach(staff => {
      if (staff.isPresent && !staff.evidenceAdded && !staff.showWarning && !timerRefs.current[staff.no]) {
        timerRefs.current[staff.no] = setTimeout(() => {
          setCurrentStaff(prevStaff =>
            prevStaff.map(s =>
              s.no === staff.no ? { ...s, showWarning: true } : s
            )
          );
          delete timerRefs.current[staff.no];
        }, 300000); // 5 minutes
      }
    });

    return () => {
      Object.values(timerRefs.current).forEach(clearTimeout);
      timerRefs.current = {};
    };
  }, [currentStaff]);

  const [staff1, staff2] = currentStaff;

  const handlePresentClick = (staffId) => {
    setCurrentStaff(prevStaff =>
      prevStaff.map(staff =>
        staff.no === staffId ? { ...staff, isPresent: true } : staff
      )
    );
  };

  const handleDismissWarning = (staffId) => {
    setCurrentStaff(prevStaff =>
      prevStaff.map(staff =>
        staff.no === staffId ? { ...staff, showWarning: false } : staff
      )
    );
  };

  const handleAddEvidence = (staffId) => {
    if (timerRefs.current[staffId]) {
      clearTimeout(timerRefs.current[staffId]);
      delete timerRefs.current[staffId];
    }
    setCurrentStaff(prevStaff =>
      prevStaff.map(staff =>
        staff.no === staffId ? { ...staff, evidenceAdded: true, showWarning: false } : staff
      )
    );
    console.log(`Evidence added for staff ID: ${staffId}`);
  };

  return (
    <div className="p-8 h-full">
      <div className="text-lg font-semibold text-blue-600 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        📅 {currentTime ? formatDateTime(currentTime) : 'Loading date and time...'}
      </div>
      <div className="fixed top-4 right-0 flex flex-col items-end gap-4 z-50 w-72 p-4 pointer-events-none">
        {currentStaff.map(staff => (
          staff.showWarning && (
            <div key={staff.no} className="pointer-events-auto">
              <WarningPopup staff={staff} onDismiss={handleDismissWarning} onAddEvidence={handleAddEvidence} />
            </div>
          )
        ))}
      </div>
      <div className="w-full h-full bg-gray-200 p-4 flex gap-4 rounded-lg">
        <div className="flex flex-col gap-4 w-1/2">
          <div className="bg-white h-1/4 rounded-lg shadow-md p-4 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-700">Volume Today</h2>
            <div className="flex-grow flex justify-around items-center text-center">
              <div>
                <p className="text-4xl font-bold text-gray-800">15</p>
                <p className="text-xs text-gray-500 mt-1">Orders to ship</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-800">4</p>
                <p className="text-xs text-gray-500 mt-1">Overdue shipments</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-800">39</p>
                <p className="text-xs text-gray-500 mt-1">Customers Today</p>
              </div>
            </div>
          </div>
          <div className="bg-white h-3/4 rounded-lg shadow-md p-4 flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Inventory</h2>
            <div className="flex-grow overflow-y-auto text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-semibold text-gray-600 pb-1 pr-2">Item Name</th>
                    <th className="text-left font-semibold text-gray-600 pb-1">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="pt-1 pr-2">Chocolate Chip Cookies</td><td className="pt-1">150</td></tr>
                  <tr><td className="pt-1 pr-2">Blueberry Muffins</td><td className="pt-1">80</td></tr>
                  <tr><td className="pt-1 pr-2">Croissants</td><td className="pt-1">120</td></tr>
                  <tr><td className="pt-1 pr-2">Red Velvet Cake</td><td className="pt-1">20</td></tr>
                  <tr><td className="pt-1 pr-2">Cheesecake</td><td className="pt-1">35</td></tr>
                  <tr><td className="pt-1 pr-2">Earl Grey Tea Bags</td><td className="pt-1">500</td></tr>
                  <tr><td className="pt-1 pr-2">Green Tea Bags</td><td className="pt-1">450</td></tr>
                  <tr><td className="pt-1 pr-2">Chamomile Tea Bags</td><td className="pt-1">300</td></tr>
                  <tr><td className="pt-1 pr-2">Espresso Beans</td><td className="pt-1">50 kg</td></tr>
                  <tr><td className="pt-1 pr-2">Milk</td><td className="pt-1">40L</td></tr>
                  <tr><td className="pt-1 pr-2">Sugar Packets</td><td className="pt-1">1000</td></tr>
                  <tr><td className="pt-1 pr-2">Brownies</td><td className="pt-1">90</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-1/2">
          <div className="bg-white h-2/5 rounded-lg shadow-md p-4 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">On-site Count</h2>
            <div className="flex-grow flex justify-around items-center px-8">
              <div className="text-center">
                <p className="text-6xl font-bold text-gray-800">12/17</p>
                <p className="text-sm text-gray-500 mt-1">Visitors</p>
              </div>
              <div className="text-center">
                <p className="text-6xl font-bold text-gray-800">2/2</p>
                <p className="text-sm text-gray-500 mt-1">Staff</p>
              </div>
            </div>
          </div>
          <div className="bg-white h-3/5 rounded-lg shadow-md p-4 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Attendance</h2>
            <div className="flex-grow flex flex-col gap-4 justify-around">
              <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center flex-grow">
                {staff1 ? (
                  <>
                    <div>
                      <p className="font-semibold text-gray-800">{staff1.name}</p>
                      <p className="text-sm text-gray-500">{staff1.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePresentClick(staff1.no)}
                        disabled={staff1.isPresent}
                        className={`${
                          staff1.isPresent
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-200 text-green-800 hover:bg-green-500 hover:text-white'
                        } font-semibold py-2 px-4 rounded-lg transition-colors duration-200`}
                      >
                        {staff1.isPresent ? 'Present' : 'Mark Present'}
                      </button>
                      {staff1.isPresent && !staff1.evidenceAdded && (
                        <button
                          onClick={() => handleAddEvidence(staff1.no)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Add Evidence
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 w-full text-center">No staff on duty</p>
                )}
              </div>
              <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center flex-grow">
                {staff2 ? (
                  <>
                    <div>
                      <p className="font-semibold text-gray-800">{staff2.name}</p>
                      <p className="text-sm text-gray-500">{staff2.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePresentClick(staff2.no)}
                        disabled={staff2.isPresent}
                        className={`${
                          staff2.isPresent
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-200 text-green-800 hover:bg-green-500 hover:text-white'
                        } font-semibold py-2 px-4 rounded-lg transition-colors duration-200`}
                      >
                        {staff2.isPresent ? 'Present' : 'Mark Present'}
                      </button>
                      {staff2.isPresent && !staff2.evidenceAdded && (
                        <button
                          onClick={() => handleAddEvidence(staff2.no)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Add Evidence
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 w-full text-center">-</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}