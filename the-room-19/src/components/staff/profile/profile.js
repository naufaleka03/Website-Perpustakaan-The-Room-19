"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaCamera } from 'react-icons/fa'; // Import camera icon
import { createClient } from '@/app/supabase/client'; // Updated import path
import { useRouter } from 'next/navigation'; // Import useRouter
import Link from 'next/link';

export default function Profile({ profilePicture, setProfilePicture }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [userId, setUserId] = useState(null);
  
  // Separate state for personal information and account settings
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    gender: 'Male', // Default value
    phone: '',
    position: '', // Add staff position
    hireDate: '', // Add hire date
  });

  const [accountSettings, setAccountSettings] = useState({
    email: '', 
    password: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const supabase = createClient(); // Create Supabase client instance
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserId(session.user.id);
          // Fetch user email
          setAccountSettings((prev) => ({ ...prev, email: session.user.email })); // Set email from session
        }
      } catch (error) {
        console.error('Error getting session:', error);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (userId) {
        try {
          const { data, error } = await supabase.from('staffs').select('profile_picture').eq('id', userId).single();
          if (error) throw error;
          
          if (data && data.profile_picture) {
            console.log('Fetched profile picture URL:', data.profile_picture);
            setProfilePicture(data.profile_picture);
          }
        } catch (error) {
          console.error('Error fetching profile picture:', error.message);
          // Do not set an error for the user, just log it
        }
      }
    };

    fetchProfilePicture();
  }, [userId, setProfilePicture]); // Run when userId changes

  useEffect(() => {
    const fetchPersonalInfo = async () => {
      if (userId) {
        try {
          const { data, error } = await supabase.from('staffs').select('*').eq('id', userId).single();
          if (error) throw error;
          
          if (data) {
            setPersonalInfo({
              fullName: data.name || '',
              gender: data.gender || 'Male', 
              phone: data.phone_number || '', // Default to empty string if not set
              position: data.position || '', // Add staff position
              hireDate: data.hire_date ? new Date(data.hire_date).toLocaleDateString() : '',
            });
          }
        } catch (error) {
          console.error('Error fetching personal information:', error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPersonalInfo();
  }, [userId]); // Run when userId changes

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const isConfirmed = window.confirm('Are you sure you want to change your profile picture?');
          if (isConfirmed) {
            setLoading(true);
            
            // Fetch current profile picture URL
            const { data: currentData, error: fetchError } = await supabase.from('staffs').select('profile_picture').eq('id', userId).single();
            if (fetchError) throw fetchError;
            
            // Delete previous image if it exists
            if (currentData && currentData.profile_picture) {
              const previousImageName = currentData.profile_picture.split('/').pop(); // Extract the image name
              await supabase.storage.from('profile-pictures').remove([`public/${previousImageName}`]); // Delete previous image
            }

            // Upload the new image
            const { data, error: uploadError } = await supabase.storage.from('profile-pictures').upload(`public/${file.name}`, file);
            if (uploadError) throw uploadError;

            // Construct the public URL for the uploaded image
            const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/public/${file.name}`;
            console.log('Image URL being set in database:', imageUrl);

            // Update the profile picture in the database
            const { error: updateError } = await supabase.from('staffs').update({ profile_picture: imageUrl }).eq('id', userId);
            if (updateError) throw updateError;
            
            setProfilePicture(imageUrl);
            setLoading(false);
          } else {
            console.log('Profile picture change canceled.');
          }
        } catch (error) {
          console.error('Error updating profile picture:', error.message);
          setErrorMessage('Failed to update profile picture. Please try again.');
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMessage('');
      
      // Update the personal information in the database
      const { error } = await supabase
        .from('staffs')
        .update({
          name: personalInfo.fullName,
          gender: personalInfo.gender,
          phone_number: personalInfo.phone,
          position: personalInfo.position,
        })
        .eq('id', userId);

      if (error) throw error;

      console.log('Personal Information Updated:', personalInfo);
      alert('Personal information updated successfully!');
      setLoading(false);
    } catch (error) {
      console.error('Error updating personal information:', error.message);
      setErrorMessage('Failed to update personal information. Please try again.');
      setLoading(false);
    }
  };

  const handleAccountSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMessage('');
      
      // Change password if new password is provided
      if (accountSettings.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: accountSettings.newPassword,
        });

        if (passwordError) throw passwordError;
        
        alert('Password updated successfully!');
        
        // Reset password fields
        setAccountSettings((prev) => ({
          ...prev,
          password: '',
          newPassword: '',
          confirmNewPassword: '',
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error updating account settings:', error.message);
      setErrorMessage('Failed to update account settings. Please try again.');
      setLoading(false);
    }
  };

  // Profile Loading Skeleton
  const ProfileLoadingSkeleton = () => (
    <div className="w-full min-h-screen bg-[#7b7c3a] p-8">
      <div className="max-w-[1200px] mx-auto bg-white rounded-xl shadow-md p-6 mb-6 animate-pulse">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded-full w-16 mb-1"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto bg-white rounded-xl shadow-md">
        <div className="flex justify-center border-b">
          {['Profile', 'Edit Profile', 'Security'].map((tab, i) => (
            <div key={i} className="px-4 py-2">
              <div className="h-5 bg-gray-300 rounded w-20"></div>
            </div>
          ))}
        </div>
        <div className="p-6">
          <div className="space-y-4 px-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
                <div className="h-5 bg-gray-300 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <ProfileLoadingSkeleton />;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#232310] to-[#5f5f2c] p-8">
      {errorMessage && (
        <div className="max-w-[1200px] mx-auto mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{errorMessage}</p>
        </div>
      )}
      
      {/* Card Profile */}
      <div className="max-w-[1200px] mx-auto bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-4 group">
            {profilePicture ? (
              <Image
                src={profilePicture}
                alt="Profile"
                fill
                className="rounded-full object-cover transition-opacity duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-2xl font-semibold text-gray-600">
                {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : 'S'}
              </div>
            )}
            <label htmlFor="profilePictureUpload" className="absolute inset-0 cursor-pointer flex items-center justify-center transition duration-300 hover:bg-black hover:bg-opacity-50 rounded-full">
              <FaCamera className="text-white text-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </label>
            <input
              type="file"
              id="profilePictureUpload"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="absolute opacity-0 w-full h-full cursor-pointer"
            />
          </div>
          <h2 className="text-md font-semibold text-[#111010]">{personalInfo.fullName}</h2>
          <div className="flex flex-col items-center mt-1">
            <div className="rounded-full px-3 pb-0.5 bg-[#2e3105]">
              <span className="text-white text-xs">Staff</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{personalInfo.position || 'Position not set'}</p>
          </div>
        </div>
      </div>

      {/* Card Detail */}
      <div className="max-w-[1200px] mx-auto bg-white rounded-xl shadow-md">
        {/* Tabs */}
        <div className="flex justify-center border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'profile' ? 'text-[#111010] border-b-2 border-[#111010]' : 'text-[#666666]'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'edit' ? 'text-[#111010] border-b-2 border-[#111010]' : 'text-[#666666]'}`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'security' ? 'text-[#111010] border-b-2 border-[#111010]' : 'text-[#666666]'}`}
          >
            Security
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4 px-2">
              {/* Display personal information */}
              <div>
                <label className="text-sm text-[#666666]">Full Name</label>
                <p className="text-[#111010] font-medium text-sm">{personalInfo.fullName}</p>
              </div>
              <div>
                <label className="text-sm text-[#666666]">Position</label>
                <p className="text-[#111010] font-medium text-sm">{personalInfo.position || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm text-[#666666]">Gender</label>
                <p className="text-[#111010] font-medium text-sm">{personalInfo.gender}</p>
              </div>
              <div>
                <label className="text-sm text-[#666666]">Phone</label>
                <p className="text-[#111010] font-medium text-sm">{personalInfo.phone}</p>
              </div>
              <div>
                <label className="text-sm text-[#666666]">Hire Date</label>
                <p className="text-[#111010] font-medium text-sm">
                  {personalInfo.hireDate || 'Not available'}
                  {personalInfo.hireDate && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({Math.floor((new Date() - new Date(personalInfo.hireDate)) / (1000 * 60 * 60 * 24 * 30))} months of service)
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="space-y-6">
              {/* Personal Information Form */}
              <div className="bg-white rounded-xl px-6 py-2">
                <h3 className="text-md font-semibold text-[#111010] mb-4">Personal Information</h3>
                <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm text-[#666666] font-medium">Full Name</label>
                    <input
                      type="text"
                      value={personalInfo.fullName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#666666] font-medium">Position</label>
                    <input
                      type="text"
                      value={personalInfo.position}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, position: e.target.value })}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Enter your staff position"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#666666] font-medium">Gender</label>
                    <select
                      value={personalInfo.gender}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-[#666666] font-medium">Phone</label>
                    <input
                      type="text"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-[35px] bg-[#2e3105] text-white rounded-3xl text-sm font-medium transition-all duration-300 hover:bg-[#3e4310]"
                  >
                    Save Personal Information
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Account Settings Form */}
              <div className="bg-white rounded-xl px-6 py-2">
                <h3 className="text-md font-semibold text-[#111010] mb-4">Account Settings</h3>
                <form onSubmit={handleAccountSettingsSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm text-[#666666] font-medium">Email</label>
                    <input
                      type="email"
                      value={accountSettings.email}
                      readOnly 
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#666666] font-medium">Current Password</label>
                    <input
                      type="password"
                      value={accountSettings.password}
                      onChange={(e) => setAccountSettings({ ...accountSettings, password: e.target.value })}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#666666] font-medium">New Password</label>
                    <input
                      type="password"
                      value={accountSettings.newPassword}
                      onChange={(e) => setAccountSettings({ ...accountSettings, newPassword: e.target.value })}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#666666] font-medium">Confirm New Password</label>
                    <input
                      type="password"
                      value={accountSettings.confirmNewPassword}
                      onChange={(e) => setAccountSettings({ ...accountSettings, confirmNewPassword: e.target.value })}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 mb-2 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-[35px] bg-[#2e3105] text-white rounded-3xl text-sm font-medium transition-all duration-300 hover:bg-[#3e4310]"
                  >
                    Update Account Settings
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
