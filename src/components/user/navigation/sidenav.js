'use client';

import NavLinks from './nav-links';
import { IoLogOut } from "react-icons/io5";
import { clsx } from 'clsx';
import Link from 'next/link';
import { createClient } from '@/app/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SideNav({ isExpanded, profilePicture }) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [memberStatus, setMemberStatus] = useState('guest');

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
    const fetchUserInfo = async () => {
      if (userId) {
        try {
          const { data, error } = await supabase
            .from('visitors')
            .select('name, member_status')
            .eq('id', userId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setUserName(data.name || 'User');
            setMemberStatus(data.member_status || 'guest');
          }
        } catch (err) {
          console.error('Error fetching user info:', err.message);
          setUserName('User');
        }
      }
    };

    fetchUserInfo();
  }, [userId]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect to login page
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
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
            <Link href="/user/dashboard/profile">
              <div className="flex items-center gap-3 mb-4 mt-2 cursor-pointer">
                <div className="w-12 h-12 flex-shrink-0 relative overflow-hidden">
                  {profilePicture ? (
                    <Image
                      src={profilePicture}
                      alt="Profile"
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="text-[#5d7285] text-xs font-semibold truncate">{userName || 'User Name'}</div>
                  <div className="flex items-center mt-1">
                    <div className={`rounded-full px-3 pb-0.5 ${memberStatus === 'member' ? 'bg-[#2e3105]' : 'bg-gray-400'}`}>
                      <span className="text-white text-xs">{memberStatus === 'member' ? 'Member' : 'Guest'}</span>
                    </div>
                  </div>
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

function NavItem({ icon, label, isActive = false, collapsed = false, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-gray-100 transition-colors',
        {
          'bg-[#eff0c3] text-[#52570d]': isActive,
          'text-[#5d7285]': !isActive,
          'justify-center': collapsed,
          'opacity-50 cursor-not-allowed': disabled,
          'hover:bg-gray-100': !disabled
        }
      )}
    >
      {icon}
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}

function SubNavItem({ label }) {
  return (
    <div className="ml-12 text-[#5d7285] py-2">
      {label}
    </div>
  )
}