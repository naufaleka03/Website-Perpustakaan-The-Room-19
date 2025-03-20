'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import SideNav from '@/components/user/navigation/sidenav';
import { createClient } from '@/app/supabase/client';

export default function Layout({ children }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const supabase = createClient();
  const [userId, setUserId] = useState(null);

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

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed header */}
      <div className="flex-none">
        <Header isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      </div>
      
      {/* Main content area with fixed sidenav */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed sidenav */}
        <div className="flex-none">
          <SideNav profilePicture={profilePicture} isExpanded={isExpanded} />
        </div>
        
        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}