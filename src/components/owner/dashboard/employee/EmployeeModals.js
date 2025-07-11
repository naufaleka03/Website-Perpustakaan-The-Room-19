"use client";

export function WarningModal({ isOpen, employee, warningReason, setWarningReason, onClose, onSend }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-30">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-4">
        <h3 className="text-lg font-bold text-gray-900">Issue Warning to <span className="font-semibold">{employee?.name}</span></h3>
        <div className="mt-4">
          <label htmlFor="warningReason" className="block text-sm font-medium text-gray-700">Reason</label>
          <textarea
            id="warningReason"
            name="warningReason"
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
            value={warningReason}
            onChange={(e) => setWarningReason(e.target.value)}
            placeholder="Enter the reason for the warning..."
          ></textarea>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSend}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1"
          >
            Send Warning
          </button>
        </div>
      </div>
    </div>
  );
}

export function RevokeModal({ isOpen, employee, terminationLetter, onFileChange, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h3 className="text-lg font-bold text-gray-900">
          {employee?.status === 'Active' ? 'Revoke Access' : 'Reinstate Employee'}
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to {employee?.status === 'Active' ? 'revoke access for' : 'reinstate'} <span className="font-semibold">{employee?.name}</span>?
        </p>

        {employee?.status === 'Active' && (
          <div className="mt-4">
            <label htmlFor="terminationLetter" className="block text-sm font-medium text-gray-700 mb-1">Please attach termination letter (in pdf format)</label>
            <input
              type="file"
              id="terminationLetter"
              name="terminationLetter"
              accept=".pdf"
              onChange={onFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`text-white text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              employee?.status === 'Active' 
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600' 
              : 'bg-green-600 hover:bg-green-700 focus:ring-green-600'
            }`}
          >
            {employee?.status === 'Active' ? 'Confirm' : 'Reinstate'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DetailsModal({ 
  isOpen, 
  employee, 
  onClose, 
  isEditMode, 
  editFormData, 
  editFormErrors, 
  onStartEdit, 
  onCancelEdit, 
  onEditFormChange, 
  onSaveEdit 
}) {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-auto relative p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit Employee Details' : `${employee.name}'s Details`}
          </h3>
          <div className="flex items-center space-x-3">
            {!isEditMode && (
              <button
                onClick={() => onStartEdit(employee)}
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Edit Details
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
              aria-label="Close details modal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {isEditMode ? (
          // Edit Form
          <form onSubmit={(e) => { e.preventDefault(); onSaveEdit(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={editFormData.fullName || ''}
                  onChange={onEditFormChange}
                  className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                    editFormErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {editFormErrors.fullName && <p className="text-red-500 text-xs mt-1">{editFormErrors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={editFormData.gender || ''}
                  onChange={onEditFormChange}
                  className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                    editFormErrors.gender ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
                {editFormErrors.gender && <p className="text-red-500 text-xs mt-1">{editFormErrors.gender}</p>}
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={editFormData.department || ''}
                  onChange={onEditFormChange}
                  className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                    editFormErrors.department ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {editFormErrors.department && <p className="text-red-500 text-xs mt-1">{editFormErrors.department}</p>}
              </div>

              <div>
                <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                <select
                  id="shift"
                  name="shift"
                  value={editFormData.shift || ''}
                  onChange={onEditFormChange}
                  className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                    editFormErrors.shift ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Shift</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
                {editFormErrors.shift && <p className="text-red-500 text-xs mt-1">{editFormErrors.shift}</p>}
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={editFormData.age || ''}
                  onChange={onEditFormChange}
                  min="18"
                  max="100"
                  className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                    editFormErrors.age ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {editFormErrors.age && <p className="text-red-500 text-xs mt-1">{editFormErrors.age}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editFormData.email || ''}
                  onChange={onEditFormChange}
                  className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                    editFormErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {editFormErrors.email && <p className="text-red-500 text-xs mt-1">{editFormErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={editFormData.phone || ''}
                  onChange={onEditFormChange}
                  className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                    editFormErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {editFormErrors.phone && <p className="text-red-500 text-xs mt-1">{editFormErrors.phone}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={editFormData.address || ''}
                  onChange={onEditFormChange}
                  rows="3"
                  className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                    editFormErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {editFormErrors.address && <p className="text-red-500 text-xs mt-1">{editFormErrors.address}</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancelEdit}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          // View Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <p className="font-semibold text-gray-500">Department</p>
              <p className="text-gray-800">{employee.department}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500">Age</p>
              <p className="text-gray-800">{employee.age}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500">Hire Date</p>
              <p className="text-gray-800">{employee.hireDate}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500">Gender</p>
              <p className="text-gray-800">{employee.gender === 'M' ? 'Male' : 'Female'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-semibold text-gray-500">Address</p>
              <p className="text-gray-800">{employee.address}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500">Email Address</p>
              <p className="text-gray-800">{employee.email}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500">Phone Number</p>
              <p className="text-gray-800">{employee.phone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
