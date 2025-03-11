"use client"
import { useState } from 'react';
import Image from 'next/image';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    fullName: 'Wildan Fauzan Ramdana',
    gender: 'Laki-Laki',
    phone: '082377889900',
    address: 'Banten',
    email: 'wildanfauzan@gmail.com',
    password: '********'
  });

  return (
    <div className="w-full min-h-screen bg-white p-8">
      {/* Card Profile */}
      <div className="max-w-[1200px] mx-auto bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-4">
            <Image
              src="/profile-placeholder.jpg"
              alt="Profile"
              fill
              className="rounded-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
          </div>
          <h2 className="text-md font-semibold text-[#111010]">{userData.fullName}</h2>
        </div>
      </div>

      {/* Card Detail */}
      <div className="max-w-[1200px] mx-auto bg-white rounded-xl shadow-md">
        {/* Tabs */}
        <div className="flex justify-center border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-8 py-2 text-sm font-medium ${
              activeTab === 'profile'
                ? 'text-[#111010] border-b-2 border-[#111010]'
                : 'text-[#666666]'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-8 py-2 text-sm font-medium ${
              activeTab === 'edit'
                ? 'text-[#111010] border-b-2 border-[#111010]'
                : 'text-[#666666]'
            }`}
          >
            Edit Profile
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#666666]">Full Name</label>
                <p className="text-[#111010] font-medium text-sm">{userData.fullName}</p>
              </div>
              <div>
                <label className="text-sm text-[#666666]">Gender</label>
                <p className="text-[#111010] font-medium text-sm">{userData.gender}</p>
              </div>
              <div>
                <label className="text-sm text-[#666666]">Phone</label>
                <p className="text-[#111010] font-medium text-sm">{userData.phone}</p>
              </div>
              <div>
                <label className="text-sm text-[#666666]">Address</label>
                <p className="text-[#111010] font-medium text-sm">{userData.address}</p>
              </div>
              <div>
                <label className="text-sm text-[#666666]">Email</label>
                <p className="text-[#111010] font-medium text-sm">{userData.email}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Personal Information Card */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-md font-semibold text-[#111010] mb-4">Personal Information</h3>
                <form className="space-y-4">
                  <div>
                    <label className="text-sm text-[#666666] font-medium">Full Name</label>
                    <input
                      type="text"
                      value={userData.fullName}
                      onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#666666] font-medium">Gender</label>
                    <input
                      type="text"
                      value={userData.gender}
                      onChange={(e) => setUserData({...userData, gender: e.target.value})}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Enter your gender"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#666666] font-medium">Phone</label>
                    <input
                      type="text"
                      value={userData.phone}
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#666666] font-medium">Address</label>
                    <input
                      type="text"
                      value={userData.address}
                      onChange={(e) => setUserData({...userData, address: e.target.value})}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Enter your address"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#111010] text-white py-2 rounded-2xl text-sm font-medium"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
              <hr className="border-[#767676]/40 my-4" />
              {/* Account Settings Card */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-md font-semibold text-[#111010] mb-4">Account Settings</h3>
                <form className="space-y-4">
                  <div>
                    <label className="text-sm text-[#666666] font-medium">Email</label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({...userData, email: e.target.value})}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#666666] font-medium">Current Password</label>
                    <input
                      type="password"
                      value={userData.password}
                      onChange={(e) => setUserData({...userData, password: e.target.value})}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#666666] font-medium">New Password</label>
                    <input
                      type="password"
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#666666] font-medium">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#111010] placeholder-[#444444]"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#111010] text-white py-2 rounded-2xl text-sm font-medium"
                  >
                    Update Account
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