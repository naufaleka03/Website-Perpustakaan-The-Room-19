import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaPencilAlt, FaCloudDownloadAlt, FaSpinner } from 'react-icons/fa';
import { createClient } from '@/app/supabase/client';
import { useRouter } from 'next/navigation';

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmButtonClass }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="flex items-center justify-center min-h-full p-4">
        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={confirmButtonClass}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DetailMembershipModal({ isOpen, onClose, membershipId }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffId, setStaffId] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: '',
    isSubmitting: false
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    action: null,
    title: '',
    message: '',
    confirmText: '',
    confirmButtonClass: ''
  });
  const supabase = createClient();
  const router = useRouter();

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStaffId(session.user.id);
        }
      } catch (error) {
        console.error('Error getting staff session:', error);
      }
    };
    
    fetchUserId();
  }, []);

  useEffect(() => {
    if (isOpen && membershipId) {
      fetchMembershipDetails();
    }
  }, [isOpen, membershipId]);

  const fetchMembershipDetails = async () => {
    if (!membershipId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/memberships/${membershipId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch membership application details');
      }
      
      const data = await response.json();
      setApplication(data);
    } catch (error) {
      console.error('Error fetching membership details:', error);
      setError('Failed to load membership application details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generateSignedUrl = async () => {
    if (!application?.id_card_url) return;
    try {
      // Use createSignedUrl for private buckets
      const { data, error } = await supabase.storage
        .from('verification-ids')
        .createSignedUrl(application.id_card_url, 60); // 60 seconds validity
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error generating signed URL:', error);
      alert('Failed to view ID card');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!membershipId || !staffId) return;
    
    setStatusUpdate({
      ...statusUpdate,
      isSubmitting: true
    });
    
    try {
      const response = await fetch(`/api/memberships/${membershipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: statusUpdate.notes,
          staff_id: staffId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update membership status');
      }
      
      const data = await response.json();
      
      if (data.success) {
        await fetchMembershipDetails();
        setStatusUpdate({
          status: '',
          notes: '',
          isSubmitting: false
        });
        
        if (typeof onClose === 'function') {
          onClose(true); // true indicates refresh needed
        }
      } else {
        throw new Error(data.error || 'Failed to update membership status');
      }
    } catch (error) {
      console.error('Error updating membership status:', error);
      alert('Failed to update membership status. Please try again.');
      setStatusUpdate({
        ...statusUpdate,
        isSubmitting: false
      });
    }
  };

  const handleStatusUpdateClick = (newStatus) => {
    if (newStatus === 'verified') {
      setConfirmDialog({
        isOpen: true,
        action: () => handleStatusUpdate(newStatus),
        title: <span className="text-[#666666]">Confirm Approval</span>,
        message: 'Are you sure you want to approve this membership application? This action cannot be undone.',
        confirmText: 'Approve',
        confirmButtonClass: 'px-3 py-1.5 bg-[#2e3105] text-white rounded-lg text-sm hover:bg-[#404615]'
      });
    } else if (newStatus === 'revision') {
      if (!statusUpdate.notes.trim()) {
        alert('Please provide revision notes');
        return;
      }
      handleStatusUpdate(newStatus);
    }
  };

  if (!isOpen) return null;

  // Custom Modal Implementation
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose}></div>
      <div className="flex items-center justify-center min-h-full p-4">
        <div className="w-full max-w-3xl transform overflow-hidden rounded-xl bg-white p-6 shadow-xl z-50 relative">
          <h3 className="text-lg font-medium leading-6 text-[#111010]">
            Membership Application Details
          </h3>
          
          {loading ? (
            <div className="mt-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : error ? (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          ) : application ? (
            <div className="mt-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-black">{application.full_name}</h4>
                  <p className="text-sm text-gray-500">Application ID: {application.id}</p>
                  <p className="text-sm text-gray-500">Submitted: {new Date(application.created_at).toLocaleString()}</p>
                  {application.updated_at && application.updated_at !== application.created_at && (
                    <p className="text-sm text-gray-500">Last Updated: {new Date(application.updated_at).toLocaleString()}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    application.status === 'request' ? 'bg-yellow-100 text-yellow-800' :
                    application.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    application.status === 'verified' ? 'bg-green-100 text-green-800' :
                    application.status === 'revision' ? 'bg-orange-100 text-orange-800' :
                    application.status === 'revoked' ? 'bg-red-100 text-red-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {application.status === 'revoked' ? 'Revoked' :
                    application.status === 'request' ? 'Pending Review' :
                    application.status === 'processing' ? 'Under Review' :
                    application.status === 'verified' ? 'Approved' :
                    application.status === 'revision' ? 'Needs Revision' : ''}
                  </span>
                </div>
              </div>
              
              {/* Application Timeline */}
              <div className="mb-6">
                <h5 className="text-xs text-[#666666] font-medium mb-3">Application Timeline</h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="text-sm">
                      <span className="text-gray-600">Submitted on </span>
                      <span className="text-black">{new Date(application.created_at).toLocaleString()}</span>
                    </p>
                  </div>
                  
                  {application.status !== 'request' && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <p className="text-sm">
                        <span className="text-gray-600">Status changed to </span>
                        <span className="text-black">{
                          application.status === 'processing' ? 'Under Review' :
                          application.status === 'verified' ? 'Approved' :
                          application.status === 'revision' ? 'Needs Revision' :
                          'Revoked'
                        }</span>
                        {application.staff_name && (
                          <span className="text-gray-600"> by {application.staff_name}</span>
                        )}
                        {application.updated_at && (
                          <span className="text-gray-600"> on {new Date(application.updated_at).toLocaleString()}</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Application Information */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h5 className="text-xs text-[#666666] font-medium mb-1">Contact Information</h5>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="text-gray-500"><span className="text-gray-500">Email:</span> {application.email}</p>
                    <p className="text-gray-500"><span className="text-gray-500">Phone:</span> {application.phone_number}</p>
                    <p className="text-gray-500"><span className="text-gray-500">Address:</span> {application.address}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-xs text-[#666666] font-medium mb-1">Emergency Contact</h5>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="text-gray-500"><span className="text-gray-500">Name:</span> {application.emergency_contact_name}</p>
                    <p className="text-gray-500"><span className="text-gray-500">Phone:</span> {application.emergency_contact_number}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-xs text-[#666666] font-medium mb-1">Reading Preferences</h5>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="text-gray-500"><span className="text-gray-500">Favorite Genre:</span> {application.favorite_book_genre || 'Not specified'}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-xs text-[#666666] font-medium mb-1">Identification</h5>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <button 
                      onClick={generateSignedUrl}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <FaCloudDownloadAlt size={16} />
                      View ID Card
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Review Notes Section - Enhanced */}
              {application.status === 'revoked' ? (
                <div className="mb-6">
                  <h5 className="text-xs text-[#666666] font-medium mb-1">Revoked Reason</h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#2e3105] flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {application.staff_name ? application.staff_name.charAt(0).toUpperCase() : 'S'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {application.staff_name || 'Staff Member'}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{application.notes}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {application.updated_at && new Date(application.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                application.notes && (
                  <div className="mb-6">
                    <h5 className="text-xs text-[#666666] font-medium mb-1">Review Notes</h5>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-[#2e3105] flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {application.staff_name ? application.staff_name.charAt(0).toUpperCase() : 'S'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {application.staff_name || 'Staff Member'}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">{application.notes}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {application.updated_at && new Date(application.updated_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
              
              {/* Status Update Form - Enhanced */}
              {application.status !== 'revoked' && application.status !== 'verified' && (
                <div className="mt-6 border-t pt-4">
                  <h5 className="text-sm text-[#111010] font-medium mb-3">Update Application Status</h5>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-600 font-medium mb-1">
                      Review Notes {application.status === 'revision' || application.status === 'rejected' ? '(Required)' : '(Optional)'}
                    </label>
                    <textarea
                      value={statusUpdate.notes}
                      onChange={(e) => setStatusUpdate({...statusUpdate, notes: e.target.value})}
                      className="w-full h-20 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 resize-none"
                      placeholder={application.status === 'revision' || application.status === 'rejected' ? 
                        "Please provide a reason for revision..." :
                        "Add notes for the applicant or for internal reference..."}
                    ></textarea>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs hover:bg-green-200 transition-colors disabled:opacity-50"
                      onClick={() => handleStatusUpdateClick('verified')}
                      disabled={statusUpdate.isSubmitting}
                    >
                      {statusUpdate.isSubmitting ? (
                        <FaSpinner className="animate-spin" size={12} />
                      ) : (
                        <FaCheckCircle size={12} />
                      )}
                      Approve Membership
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs hover:bg-orange-200 transition-colors disabled:opacity-50"
                      onClick={() => {
                        if (!statusUpdate.notes.trim()) {
                          alert('Please provide revision notes before requesting changes');
                          return;
                        }
                        handleStatusUpdateClick('revision');
                      }}
                      disabled={statusUpdate.isSubmitting}
                    >
                      {statusUpdate.isSubmitting ? (
                        <FaSpinner className="animate-spin" size={12} />
                      ) : (
                        <FaPencilAlt size={12} />
                      )}
                      Request Revision
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  onClick={() => onClose()}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 rounded-lg">
              No application data found
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          confirmDialog.action();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        confirmButtonClass={confirmDialog.confirmButtonClass}
      />
    </div>
  );
} 