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
  const [showForm, setShowForm] = useState(false);
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
            const { data: application, error } = await supabase
              .from('memberships')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
              
            if (!error && application) {
              setApplicationStatus(application);
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

  console.log('showForm:', showForm);
  console.log('applicationStatus:', applicationStatus);

  if (loading) {
    return null;
  }

  return (
    <MembershipForm 
      application={applicationStatus} 
      memberStatus={memberStatus}
      showForm={showForm}
      setShowForm={setShowForm}
    />
  );
}
  