"use client";
import { useState, useEffect } from 'react';
import Profile from '@/components/user/profile/profile';
import { createClient } from '@/app/supabase/client';

export default function Page() {
  const [profilePicture, setProfilePicture] = useState(null);
  const [userId, setUserId] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (userId) {
        const { data, error } = await supabase.from('visitors').select('profile_picture').eq('id', userId).single();
        if (data) {
          setProfilePicture(data.profile_picture);
        }
      }
    };

    fetchProfilePicture();
  }, [userId]);

  return <Profile profilePicture={profilePicture} setProfilePicture={setProfilePicture} />;
}
