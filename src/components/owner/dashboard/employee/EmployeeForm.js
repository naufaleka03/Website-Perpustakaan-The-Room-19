"use client";

export default function EmployeeForm({ 
  formData, 
  formErrors, 
  handleFormChange, 
  handleSaveEmployee, 
  onCancel,
  isSubmitting = false
}) {
  return (
    <div className="bg-white p-6 rounded-md border border-gray-200">
      <form onSubmit={handleSaveEmployee}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              name="fullName" 
              id="fullName" 
              value={formData.fullName} 
              onChange={handleFormChange} 
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm bg-white" 
            />
            {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select 
              id="gender" 
              name="gender" 
              value={formData.gender} 
              onChange={handleFormChange} 
              className={`w-full py-2 px-3 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-gray-700 font-medium cursor-pointer hover:border-gray-400 ${formErrors.gender ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            >
              <option value="" className="text-gray-500">Select Gender</option>
              <option value="M" className="text-gray-700 font-medium">Male</option>
              <option value="F" className="text-gray-700 font-medium">Female</option>
            </select>
            {formErrors.gender && <p className="text-red-500 text-xs mt-1">{formErrors.gender}</p>}
          </div>
        </div>

        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input 
              type="text" 
              id="department" 
              name="department" 
              value={formData.department} 
              onChange={handleFormChange} 
              placeholder="e.g., Librarian" 
              className={`w-full py-2 px-3 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white ${formErrors.department ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
            />
            {formErrors.department && <p className="text-red-500 text-xs mt-1">{formErrors.department}</p>}
          </div>
          <div className="w-1/2">
            <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
            <select 
              id="shift" 
              name="shift" 
              value={formData.shift} 
              onChange={handleFormChange} 
              className={`w-full py-2 px-3 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-gray-700 font-medium cursor-pointer hover:border-gray-400 ${formErrors.shift ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            >
              <option value="" className="text-gray-500">Select Shift</option>
              <option value="A" className="text-gray-700 font-medium">A (09:00-13:00)</option>
              <option value="B" className="text-gray-700 font-medium">B (13:00-17:00)</option>
              <option value="C" className="text-gray-700 font-medium">C (17:00-21:00)</option>
            </select>
            {formErrors.shift && <p className="text-red-500 text-xs mt-1">{formErrors.shift}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              value={formData.email} 
              onChange={handleFormChange} 
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm bg-white" 
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              id="phone" 
              value={formData.phone} 
              onChange={handleFormChange} 
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm bg-white" 
            />
            {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input 
              type="number" 
              name="age" 
              id="age" 
              value={formData.age} 
              onChange={handleFormChange} 
              min="18"
              max="65"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm bg-white" 
            />
            {formErrors.age && <p className="text-red-500 text-xs mt-1">{formErrors.age}</p>}
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input 
              type="text" 
              name="address" 
              id="address" 
              value={formData.address} 
              onChange={handleFormChange} 
              placeholder="Enter full address"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm bg-white" 
            />
            {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
