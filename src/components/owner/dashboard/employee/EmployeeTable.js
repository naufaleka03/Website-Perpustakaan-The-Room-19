"use client";

import { FaEllipsisV } from 'react-icons/fa';

export default function EmployeeTable({ 
  employees, 
  activeDropdown, 
  setActiveDropdown, 
  dropdownRef,
  onOpenWarningModal,
  onOpenDetailsModal,
  onOpenRevokeModal,
  onDeleteEmployee 
}) {
  return (
    <div className="mt-8 overflow-x-auto flex-1">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-slate-200">
              <th scope="col" className="w-16 py-3 px-4 text-left text-sm font-semibold text-black">No.</th>
              <th scope="col" className="w-2/5 py-3 px-4 text-left text-sm font-semibold text-black">Name</th>
              <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-black">Department</th>
              <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-black">Working Hours</th>
              <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-black">Shift</th>
              <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-black">Hire Date</th>
              <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-black">Gender</th>
              <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-black">Status</th>
              <th scope="col" className="py-3 px-4 text-right text-sm font-semibold text-black">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.length > 0 ? (
              employees.map((emp, index) => (
                <tr key={emp.id || emp.no || index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="w-16 py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{emp.no}</td>
                  <td className="w-2/5 py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{emp.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{emp.department}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{emp.status === 'Active' ? `${emp.workingHours || 0} hrs` : '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{emp.shift}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{emp.hireDate}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{emp.gender}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`h-2.5 w-2.5 rounded-full mr-2 ${emp.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {emp.status}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap text-right relative">
                    <button 
                      type="button" 
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors duration-200 action-button"
                      onClick={(e) => { 
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === emp.no ? null : emp.no); 
                      }}
                    >
                      <FaEllipsisV size={16} />
                    </button>
                    {activeDropdown === emp.no && (
                      <div 
                        ref={dropdownRef}
                        className={`absolute right-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 ${index >= employees.length - 2 ? 'bottom-full mb-2' : 'top-full mt-2'}`}
                        style={{ 
                          zIndex: 9999,
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}
                      >
                        <ul className="py-1">
                          {emp.status === 'Active' ? (
                            <>
                              <li>
                                <a href="#" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150" role="menuitem" onClick={(e) => { e.preventDefault(); onOpenWarningModal(emp); }}>
                                  Issue Warning
                                </a>
                              </li>
                              <li>
                                <a href="#" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150" role="menuitem" onClick={(e) => { e.preventDefault(); onOpenDetailsModal(emp); }}>
                                  Details
                                </a>
                              </li>
                              <li>
                                <a href="#" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150" role="menuitem" onClick={(e) => { e.preventDefault(); onOpenRevokeModal(emp); }}>
                                  Revoke
                                </a>
                              </li>
                              <li>
                                <a href="#" className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 hover:text-red-800 transition-colors duration-150" role="menuitem" onClick={(e) => { e.preventDefault(); if (typeof onDeleteEmployee === 'function') onDeleteEmployee(emp); }}>
                                  Delete
                                </a>
                              </li>
                            </>
                          ) : (
                            <>
                              <li>
                                <a href="#" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150" role="menuitem" onClick={(e) => { e.preventDefault(); onOpenRevokeModal(emp); }}>
                                  Reinstate
                                </a>
                              </li>
                              <li>
                                <a href="#" className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 hover:text-red-800 transition-colors duration-150" role="menuitem" onClick={(e) => { e.preventDefault(); if (typeof onDeleteEmployee === 'function') onDeleteEmployee(emp); }}>
                                  Delete
                                </a>
                              </li>
                              <li>
                                <a href="#" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150" role="menuitem" onClick={(e) => { e.preventDefault(); onOpenDetailsModal(emp); }}>
                                  Details
                                </a>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-16 text-gray-500 italic">
                  <div className="flex flex-col items-center space-y-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg font-medium">No employees match the current filter.</p>
                    <p className="text-sm text-gray-400">Try adjusting your search criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
