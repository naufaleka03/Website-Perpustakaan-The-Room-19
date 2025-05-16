import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaPencilAlt, FaCloudDownloadAlt } from 'react-icons/fa';
import { createClient } from '@/app/supabase/client';
import { useRouter } from 'next/navigation';

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
      const response = await fetch(`/api/membership/${membershipId}`);
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
      // Create a signed URL that expires in 60 seconds
      const { data, error } = await supabase.storage
        .from('public')
        .createSignedUrl(application.id_card_url, 60);
        
      if (error) throw error;
      
      // Open the signed URL in a new tab
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error generating signed URL:', error);
      alert('Failed to generate download link for ID card');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!membershipId || !staffId) return;
    
    setStatusUpdate({
      ...statusUpdate,
      isSubmitting: true
    });
    
    try {
      const response = await fetch(`/api/membership/${membershipId}`, {
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
      
      // Refresh the data
      await fetchMembershipDetails();
      
      // Reset the update form
      setStatusUpdate({
        status: '',
        notes: '',
        isSubmitting: false
      });
      
      // Trigger parent component refresh
      if (typeof onClose === 'function') {
        onClose(true); // true indicates refresh needed
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
                  <h4 className="font-medium">{application.full_name}</h4>
                  <p className="text-sm text-gray-500">Application ID: {application.id}</p>
                  <p className="text-sm text-gray-500">Submitted: {new Date(application.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    application.status === 'request' ? 'bg-yellow-100 text-yellow-800' :
                    application.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    application.status === 'verified' ? 'bg-green-100 text-green-800' :
                    application.status === 'revision' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {application.status === 'request' ? 'Pending' :
                     application.status === 'processing' ? 'Under Review' :
                     application.status === 'verified' ? 'Approved' :
                     application.status === 'revision' ? 'Needs Revision' :
                     'Rejected'}
                  </span>
                </div>
              </div>
              
              {/* Application Information */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h5 className="text-xs text-[#666666] font-medium mb-1">Contact Information</h5>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p><span className="font-medium">Email:</span> {application.email}</p>
                    <p><span className="font-medium">Phone:</span> {application.phone_number}</p>
                    <p><span className="font-medium">Address:</span> {application.address}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-xs text-[#666666] font-medium mb-1">Emergency Contact</h5>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p><span className="font-medium">Name:</span> {application.emergency_contact_name}</p>
                    <p><span className="font-medium">Phone:</span> {application.emergency_contact_number}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-xs text-[#666666] font-medium mb-1">Reading Preferences</h5>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p><span className="font-medium">Favorite Genre:</span> {application.favorite_book_genre || 'Not specified'}</p>
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
              
              {/* Review Notes (if any) */}
              {application.notes && (
                <div className="mb-6">
                  <h5 className="text-xs text-[#666666] font-medium mb-1">Review Notes</h5>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {application.notes}
                  </div>
                </div>
              )}
              
              {/* Status Update Form - only show if not verified or rejected */}
              {application.status !== 'verified' && application.status !== 'rejected' && (
                <div className="mt-6 border-t pt-4">
                  <h5 className="text-sm font-medium mb-3">Update Application Status</h5>
                  
                  <div className="mb-4">
                    <label className="block text-xs text-[#666666] font-medium mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={statusUpdate.notes}
                      onChange={(e) => setStatusUpdate({...statusUpdate, notes: e.target.value})}
                      className="w-full h-20 rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
                      placeholder="Add notes for the applicant or for internal reference..."
                    ></textarea>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 transition-colors"
                      onClick={() => handleStatusUpdate('processing')}
                      disabled={statusUpdate.isSubmitting}
                    >
                      <FaPencilAlt size={12} />
                      Mark as Processing
                    </button>
                    
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs hover:bg-green-200 transition-colors"
                      onClick={() => handleStatusUpdate('verified')}
                      disabled={statusUpdate.isSubmitting}
                    >
                      <FaCheckCircle size={12} />
                      Approve Membership
                    </button>
                    
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs hover:bg-orange-200 transition-colors"
                      onClick={() => handleStatusUpdate('revision')}
                      disabled={statusUpdate.isSubmitting}
                    >
                      <FaPencilAlt size={12} />
                      Request Revision
                    </button>
                    
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200 transition-colors"
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={statusUpdate.isSubmitting}
                    >
                      <FaTimesCircle size={12} />
                      Reject Application
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
    </div>
  );
} 