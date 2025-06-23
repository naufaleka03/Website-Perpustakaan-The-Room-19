"use client";

import NavLinks from "./nav-links";
import { IoLogOut } from "react-icons/io5";
import { clsx } from "clsx";
import { createClient } from "@/app/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function SideNav({ isExpanded }) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userId, setUserId] = useState(null);
  const [staffName, setStaffName] = useState('Staff');
  const [position, setPosition] = useState('');
  const [staffProfilePicture, setStaffProfilePicture] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch user session ID
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setUserId(data.session.user.id);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      }
    };
    
    fetchSession();
  }, []);

  // Fetch staff profile data
  useEffect(() => {
    if (!userId) return;
    
    const fetchStaffData = async () => {
      setIsLoadingProfile(true);
      
      try {
        // Simple approach - just get the data directly
        const { data } = await supabase
          .from('staffs')
          .select('name, position, profile_picture')
          .eq('id', userId)
          .single();
          
        if (data) {
          setStaffName(data.name || 'Staff');
          setPosition(data.position || 'Staff');
          
          // Handle profile picture
          if (data.profile_picture) {
            // The profile_picture field already contains the full URL
            setStaffProfilePicture(data.profile_picture);
          }
        }
      } catch (error) {
        console.error('Error fetching staff data:', error);
        // Use defaults
        setStaffName('Staff');
        setPosition('');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchStaffData();
    
    // Set up a polling interval to refresh data
    const refreshInterval = setInterval(() => {
      if (userId) fetchStaffData();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, [userId]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav
      className={clsx(
        "h-[calc(100vh-72px)] bg-white shadow-lg flex flex-col flex-grow border-solid border-y-0 border transition-all duration-300",
        isExpanded ? "w-[250px]" : "w-[75px]"
      )}
    >
      <div className="px-4 py-2 flex flex-col h-full">
        {isExpanded && (
          <>
            <Link href="/staff/dashboard/profile">
              <div className="flex items-center gap-3 mb-4 mt-2 cursor-pointer">
                <div className="w-12 h-12 flex-shrink-0 relative overflow-hidden">
                  {isLoadingProfile ? (
                    <div className="w-full h-full bg-gray-200 rounded-full animate-pulse" />
                  ) : staffProfilePicture ? (
                    <div className="w-full h-full rounded-full bg-gray-100">
                      <img
                        src={staffProfilePicture}
                        alt={staffName}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          console.error('Error loading profile image:', staffProfilePicture);
                          setStaffProfilePicture(null);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600">
                      {staffName ? staffName.charAt(0).toUpperCase() : 'S'}
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="text-[#5d7285] text-xs font-semibold truncate">{staffName}</div>
                  <div className="flex items-center mt-1">
                    <div className="bg-[#2e3105] rounded-full px-3 pb-0.5">
                      <span className="text-white text-xs">Staff</span>
                    </div>
                  </div>
                  {position && (
                    <div className="text-[#5d7285] text-xs mt-1">
                      {position}
                    </div>
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
  );
}

function NavItem({
  icon,
  label,
  isActive = false,
  collapsed = false,
  onClick,
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "w-full flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-gray-100 transition-colors",
        {
          "bg-[#eff0c3] text-[#52570d]": isActive,
          "text-[#5d7285]": !isActive,
          "justify-center": collapsed,
          "opacity-50 cursor-not-allowed": disabled,
          "hover:bg-gray-100": !disabled,
        }
      )}
    >
      {icon}
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}

function SubNavItem({ label }) {
  return <div className="ml-12 text-[#5d7285] py-2">{label}</div>;
}
