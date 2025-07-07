"use client";
import { useState, useEffect } from 'react';
import Profile from '@/components/staff/profile/profile';
import { createClient } from '@/app/supabase/client';

export default function Page() {
  const [profilePicture, setProfilePicture] = useState(null);
  const [userId, setUserId] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserId(session.user.id);
        }
      } catch (err) {
        console.error('Error getting session:', err.message);
        // Don't show error to user for a better experience
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (userId) {
        try {
          // First check if the profile_picture column exists by getting the columns
          const { data: columns, error: columnsError } = await supabase
            .from('staffs')
            .select('*')
            .limit(1);
            
          if (columnsError) {
            console.error('Error checking table structure:', columnsError.message);
            return;
          }
          
          // If the profile_picture property exists in the columns, query it
          if (columns.length > 0 && 'profile_picture' in columns[0]) {
            const { data, error } = await supabase
              .from('staffs')
              .select('profile_picture')
              .eq('id', userId)
              .single();
              
            if (error) throw error;
            
            if (data && data.profile_picture) {
              setProfilePicture(data.profile_picture);
            }
          } else {
            console.log('Profile picture column does not exist in staffs table');
            // No need to show error - just proceed without a profile picture
          }
        } catch (err) {
          console.error('Error fetching profile picture:', err.message);
          // Don't set error for better user experience
        }
      }
    };

    fetchProfilePicture();
  }, [userId]);

  return <Profile profilePicture={profilePicture} setProfilePicture={setProfilePicture} />;
}
