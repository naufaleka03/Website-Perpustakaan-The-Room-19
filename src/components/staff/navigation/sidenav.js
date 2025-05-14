'use client';

import NavLinks from './nav-links';
import { IoLogOut } from "react-icons/io5";
import { clsx } from 'clsx';
import { createClient } from '@/app/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function SideNav({ isExpanded, profilePicture }) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userId, setUserId] = useState(null);
  const [staffName, setStaffName] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState(null);
  const [localProfilePicture, setLocalProfilePicture] = useState(profilePicture);

  // Update local profile picture when prop changes
  useEffect(() => {
    if (profilePicture) {
      setLocalProfilePicture(profilePicture);
    }
  }, [profilePicture]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserId(session.user.id);
        }
      } catch (err) {
        console.error('Error getting session:', err.message);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchStaffInfo = async () => {
      if (userId) {
        try {
          // Fetch staff info including profile picture
          const { data, error } = await supabase.from('staffs').select('name, position, profile_picture').eq('id', userId).single();
          if (error) throw error;
          
          if (data) {
            setStaffName(data.name || 'Staff');
            setPosition(data.position || 'Staff');
            
            // Update profile picture if it exists in DB and differs from current
            if (data.profile_picture && (!localProfilePicture || data.profile_picture !== localProfilePicture)) {
              setLocalProfilePicture(data.profile_picture);
            }
          }
        } catch (err) {
          console.error('Error fetching staff info:', err.message);
          // Don't show error to user - use default values
          setStaffName('Staff');
          setPosition('Staff');
        }
      }
    };

    fetchStaffInfo();
  }, [userId]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect to login page
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className={clsx(
      'h-[calc(100vh-72px)] bg-white shadow-lg flex flex-col flex-grow border-solid border-y-0 border transition-all duration-300',
      isExpanded ? 'w-[250px]' : 'w-[75px]'
    )}>
      <div className="px-4 py-2 flex flex-col h-full">
        
        {isExpanded && (
          <>
            <Link href="/staff/dashboard/profile">
              <div className="flex items-center gap-3 mb-4 mt-2 cursor-pointer">
                <div className="w-12 h-12 flex-shrink-0">
                  {localProfilePicture ? (
                    <Image
                      src={localProfilePicture}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600">
                      {staffName ? staffName.charAt(0).toUpperCase() : 'S'}
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="text-[#5d7285] text-xs font-semibold truncate">{staffName || 'Staff Name'}</div>
                  <div className="flex items-center mt-1">
                    <div className="bg-[#2e3105] rounded-full px-3 pb-0.5">
                      <span className="text-white text-xs">Staff</span>
                    </div>
                  </div>
                  {position && (
                    <div className="text-[#5d7285] text-xs mt-1">{position}</div>
                  )}
                </div>
              </div>
            </Link>

            <div className="h-px bg-[#767676]/30 mb-2" />
          </>
        )}

        <div className="flex-grow overflow-y-auto text-sm">
          <NavLinks collapsed={!isExpanded} />
        </div>

        <div className="mt-auto pt-2 border-t border-[#767676]/30">
          <NavItem 
            icon={<IoLogOut size={20} />} 
            label={isLoggingOut ? "Logging out..." : "Logout"}
            collapsed={!isExpanded}
            onClick={handleLogout}
            disabled={isLoggingOut}
          />
        </div>
      </div>
    </nav>
  )
} 