'use client';

import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { signUpVisitor } from '@/app/lib/auth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [skeleton, setSkeleton] = useState(true);

  // Simulate skeleton loading
  useEffect(() => {
    const timer = setTimeout(() => setSkeleton(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required.';
    } else if (!/^\+?\d{9,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password) || !/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = 'Password must include letters, numbers, and symbols.';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await signUpVisitor(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phoneNumber
      );
      router.push('/login');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232310] to-[#5f5f2c]">
      <div className="flex flex-col items-center w-full max-w-md shadow-lg rounded-xl bg-white/90 backdrop-blur-md p-6 md:p-8">
        <h2 className="text-black text-lg font-semibold mb-3 text-center">Sign up</h2>
        <form className="flex flex-col gap-3 w-full" onSubmit={handleSignUp}>
          {/* Row: Full Name & Email (side by side on md+) */}
          <div className="flex flex-col md:flex-row gap-3 w-full">
            {/* Full Name */}
            <div className="w-full md:w-1/2">
              <label className="block text-[#666666] text-xs font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full h-8 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-[#666666]/30'} text-[#666666] text-xs px-3 transition-all duration-200 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none hover:border-[#2e3105]/50`}
                placeholder="Full name"
                autoComplete="name"
                disabled={isLoading}
              />
              <p className="text-[10px] text-[#666666]/80 mt-0.5">As on your ID</p>
              {errors.fullName && <p className="text-red-500 text-[10px] mt-0.5">{errors.fullName}</p>}
            </div>
            {/* Email */}
            <div className="w-full md:w-1/2">
              <label className="block text-[#666666] text-xs font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full h-8 rounded-lg border ${errors.email ? 'border-red-500' : 'border-[#666666]/30'} text-[#666666] text-xs px-3 transition-all duration-200 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none hover:border-[#2e3105]/50`}
                placeholder="Email address"
                autoComplete="email"
                disabled={isLoading}
              />
              <p className="text-[10px] text-[#666666]/80 mt-0.5">We'll send updates here</p>
              {errors.email && <p className="text-red-500 text-[10px] mt-0.5">{errors.email}</p>}
            </div>
          </div>
          {/* Phone Number */}
          <div className="w-full">
            <label className="block text-[#666666] text-xs font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full h-8 rounded-lg border ${errors.phoneNumber ? 'border-red-500' : 'border-[#666666]/30'} text-[#666666] text-xs px-3 transition-all duration-200 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none hover:border-[#2e3105]/50`}
              placeholder="Phone number"
              autoComplete="tel"
              disabled={isLoading}
            />
            <p className="text-[10px] text-[#666666]/80 mt-0.5">For verification and updates</p>
            {errors.phoneNumber && <p className="text-red-500 text-[10px] mt-0.5">{errors.phoneNumber}</p>}
          </div>
          {/* Password */}
          <div className="w-full">
            <div className="flex justify-between items-center">
              <label className="block text-[#666666] text-xs font-medium mb-1">Password</label>
              <button type="button" tabIndex={-1} className="mr-2 text-gray-500/80 text-xs flex items-center hover:text-[#2e3105]" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <FaEyeSlash className="mr-1" /> : <FaEye className="mr-1" />} {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full h-8 rounded-lg border ${errors.password ? 'border-red-500' : 'border-[#666666]/30'} text-[#666666] text-xs px-3 transition-all duration-200 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none hover:border-[#2e3105]/50`}
              placeholder="Create a password"
              autoComplete="new-password"
              disabled={isLoading}
            />
            <p className="text-[10px] text-[#666666]/80 mt-0.5">8+ chars, letters, numbers & symbols</p>
            {errors.password && <p className="text-red-500 text-[10px] mt-0.5">{errors.password}</p>}
          </div>
          {/* Confirm Password */}
          <div className="w-full">
            <div className="flex justify-between items-center">
              <label className="block text-[#666666] text-xs font-medium mb-1">Confirm Password</label>
              <button type="button" tabIndex={-1} className="mr-2 text-gray-500/80 text-xs flex items-center hover:text-[#2e3105]" onClick={() => setShowConfirmPassword(v => !v)}>
                {showConfirmPassword ? <FaEyeSlash className="mr-1" /> : <FaEye className="mr-1" />} {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full h-8 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-[#666666]/30'} text-[#666666] text-xs px-3 transition-all duration-200 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none hover:border-[#2e3105]/50`}
              placeholder="Re-enter password"
              autoComplete="new-password"
              disabled={isLoading}
            />
            <p className="text-[10px] text-[#666666]/80 mt-0.5">Re-enter your password</p>
            {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-0.5">{errors.confirmPassword}</p>}
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-9 mt-1 rounded-2xl transition-all duration-300 font-semibold text-white text-sm shadow-md ${isLoading ? 'bg-[#2e3105]/50 cursor-not-allowed' : 'bg-[#2e3105] hover:bg-[#3e4310] active:scale-95'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Signing up...</span>
            ) : (
              <span>Sign up</span>
            )}
          </button>
          {errors.submit && <p className="text-red-500 text-xs text-center mt-1">{errors.submit}</p>}
        </form>
        <div className="flex flex-col items-center gap-1 mt-2">
          <p className="text-xs text-gray-500">Already have an account?</p>
          <p className="text-xs text-gray-500"><Link href="/login" className="text-xs text-[#111111] underline hover:text-[#2e3105]">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}