"use client"
import { useState, useEffect } from 'react';
import { createClient } from '@/app/supabase/client';
import MembershipForm from '@/components/user/membership/MembershipForm';
import { useRouter } from 'next/navigation';
import { FaInfoCircle } from 'react-icons/fa';

export default function MembershipPage() {
  const [loading, setLoading] = useState(true);
  const [memberStatus, setMemberStatus] = useState('guest');
  const [applicationStatus, setApplicationStatus] = useState(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkMembershipStatus = async () => {
      try {
        // Get the current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // Check if user is already a member
        const { data: userData, error: userError } = await supabase
          .from('visitors')
          .select('member_status')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;
        
        if (userData) {
          setMemberStatus(userData.member_status);
          
          // If not a member, check if there's a pending application
          if (userData.member_status !== 'member') {
            const { data: applicationData, error: applicationError } = await supabase
              .from('membership_applications')
              .select('status, created_at, updated_at, notes')
              .eq('user_id', session.user.id)
              .order('created_at', { ascending: false })
              .limit(1);
              
            if (!applicationError && applicationData && applicationData.length > 0) {
              setApplicationStatus(applicationData[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error checking membership status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMembershipStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="w-full min-h-screen mx-auto bg-white px-0 pb-20 animate-pulse">
        <div className="w-full h-[240px] bg-gray-300"></div>
        <div className="max-w-[800px] mx-auto px-6 lg:px-8 mt-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  // If the user is already a member, show member information
  if (memberStatus === 'member') {
    return (
      <div className="w-full min-h-screen mx-auto bg-white px-0 pb-20">
        <div className="relative mb-8 mt-0">
          <div className="w-full h-[240px] bg-gradient-to-r from-[#2e3105] to-[#4d4d4d] object-cover" />
          <div className="absolute inset-0 flex items-center bg-gradient-to-l from-[#4d4d4d]/80 to-black/90 w-full mx-auto px-4 lg:px-8">
            <div className="max-w-[1200px] mx-auto w-full">
              <h1 className="text-[#fcfcfc] text-5xl font-medium leading-[48px] font-manrope mb-2">
                MEMBERSHIP
              </h1>
              <p className="text-[#fcfcfc]/80 max-w-xl font-light">
                Access exclusive borrowing privileges and be part of The Room 19 community.
              </p>
            </div>
          </div>
        </div>
        
        <div className="max-w-[800px] mx-auto px-6 lg:px-8 mb-12">
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-[#111010] font-manrope">Active Membership</h2>
            </div>
            
            <p className="text-[#666666] mb-6">
              You are currently an active member of The Room 19 Library. As a member, you enjoy the following benefits:
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-[#2e3105] p-1 rounded-full mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-[#111010]">Book Borrowing</h3>
                  <p className="text-sm text-[#666666]">You can borrow up to 2 books for 14 days</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-[#2e3105] p-1 rounded-full mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-[#111010]">Event Discounts</h3>
                  <p className="text-sm text-[#666666]">Exclusive discounts on special library events</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-[#2e3105] p-1 rounded-full mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-[#111010]">Priority Reservation</h3>
                  <p className="text-sm text-[#666666]">Priority access to new books and reading spaces</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
              <FaInfoCircle className="text-blue-500 text-lg flex-shrink-0 mt-1" />
              <p className="text-sm text-blue-800">
                Visit the <a href="/user/dashboard/books" className="font-medium underline">book catalog</a> to start borrowing books or check our <a href="/user/dashboard/reservation/event-list" className="font-medium underline">upcoming events</a> to participate in our community activities.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If the user has a pending application, show the application status
  if (applicationStatus) {
    return (
      <div className="w-full min-h-screen mx-auto bg-white px-0 pb-20">
        <div className="relative mb-8 mt-0">
          <div className="w-full h-[240px] bg-gradient-to-r from-[#2e3105] to-[#4d4d4d] object-cover" />
          <div className="absolute inset-0 flex items-center bg-gradient-to-l from-[#4d4d4d]/80 to-black/90 w-full mx-auto px-4 lg:px-8">
            <div className="max-w-[1200px] mx-auto w-full">
              <h1 className="text-[#fcfcfc] text-5xl font-medium leading-[48px] font-manrope mb-2">
                MEMBERSHIP
              </h1>
              <p className="text-[#fcfcfc]/80 max-w-xl font-light">
                Check your membership application status
              </p>
            </div>
          </div>
        </div>
        
        <div className="max-w-[800px] mx-auto px-6 lg:px-8 mb-12">
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-xl font-semibold text-[#111010] mb-6 font-manrope">Application Status</h2>
            
            {applicationStatus.status === 'request' && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">Pending Review</h3>
                  <p className="text-yellow-700 text-sm">
                    Your application has been submitted and is waiting for review by our staff. 
                    We usually process applications within 1-2 business days.
                  </p>
                  <p className="text-yellow-700 text-sm mt-2">
                    Application submitted: {new Date(applicationStatus.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            
            {applicationStatus.status === 'processing' && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">Under Review</h3>
                  <p className="text-blue-700 text-sm">
                    Your application is currently being reviewed by our staff. 
                    We'll notify you once the review is complete.
                  </p>
                  <p className="text-blue-700 text-sm mt-2">
                    Last updated: {new Date(applicationStatus.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            
            {applicationStatus.status === 'revision' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Revision Required</h3>
                  <p className="text-red-700 text-sm">
                    Your application needs some revisions before it can be approved. 
                    Please submit a new application with the following changes:
                  </p>
                  <div className="p-3 bg-white rounded mt-3 text-red-700 text-sm border border-red-200">
                    {applicationStatus.notes || "Please provide clearer photos of your ID or update your contact information."}
                  </div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-[#2e3105] text-white rounded text-sm hover:bg-[#404615] transition"
                  >
                    Submit New Application
                  </button>
                </div>
              </div>
            )}
            
            {applicationStatus.status === 'rejected' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Application Rejected</h3>
                  <p className="text-red-700 text-sm">
                    We're sorry, but your membership application has been rejected.
                  </p>
                  <div className="p-3 bg-white rounded mt-3 text-red-700 text-sm border border-red-200">
                    <strong>Reason:</strong> {applicationStatus.notes || "Your application does not meet our current membership criteria."}
                  </div>
                  <p className="text-red-700 text-sm mt-3">
                    If you believe this is a mistake or would like to apply again, please contact our support team
                    or submit a new application after addressing the issues mentioned above.
                  </p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-[#2e3105] text-white rounded text-sm hover:bg-[#404615] transition"
                  >
                    Submit New Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, show the membership application form
  return <MembershipForm />;
}
  