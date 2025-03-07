'use client';

import { useState } from 'react';
import { FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { signUpVisitor } from '@/app/lib/auth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
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
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-26">
      <div className="flex items-center justify-center w-full max-w-[1000px] h-[600px] shadow-md">
        {/* Image Section */}
        <div className="w-1/2 h-full rounded-l-xl flex items-center justify-center">
          <Image
            src="/signup-image.png"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-full rounded-l-xl object-cover"
            alt="The Room 19 independent library logo"
          />
        </div>

        {/* Signup Form Section */}
        <div className="w-1/2 h-full bg-white rounded-r-xl">
          <div className="h-full p-14 flex flex-col justify-center">
            <div className="flex flex-col items-center gap-3">
              <h2 className="text-black text-lg font-medium pt-4">Sign up</h2>
              
              {/* Form fields */}
              {[
                { label: 'Full Name', type: 'text', name: 'fullName' },
                { label: 'Email address', type: 'email', name: 'email' },
                { label: 'Phone Number', type: 'tel', name: 'phoneNumber' },
              ].map((field) => (
                <div key={field.label} className="w-full space-y-1">
                  <label className="text-gray-500 text-sm">{field.label}</label>
                  <input 
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full h-10 rounded-xl border border-gray-500/30 text-gray-500 text-sm px-4"
                  />
                </div>
              ))}

              {/* Password fields */}
              {[
                { label: 'Password', name: 'password', showHint: true },
                { label: 'Confirm Password', name: 'confirmPassword', showHint: false },
              ].map((field) => (
                <div key={field.label} className="w-full space-y-1">
                  <div className="flex justify-between">
                    <label className="text-gray-500 text-sm">{field.label}</label>
                    <button className="mr-2 text-gray-500/80 text-sm flex items-center">
                      <FaEyeSlash className="mr-1 scale-x-[-1]" />Hide
                    </button>
                  </div>
                  <input 
                    type="password"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full h-10 rounded-xl border border-gray-500/30 text-gray-500 px-4"
                  />
                  {field.showHint && (
                    <p className="text-xs text-gray-500 mt-1">
                      Use 8 or more characters with a mix of letters, numbers & symbols
                    </p>
                  )}
                </div>
              ))}

              {/* Signup Button */}
              <button 
                onClick={handleSignUp}
                className={`w-full h-10 mt-3 rounded-3xl transition-all duration-300 ${
                    isLoading 
                        ? 'bg-[#2e3105]/50 cursor-not-allowed' 
                        : 'bg-[#2e3105] hover:bg-[#3e4310]'
                }`}
              >
                <span className="text-white text-md font-medium">Sign up</span>
              </button>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {/* Login link */}
              <p className="text-sm pb-4">
                <span className="text-gray-500">Already have an account? </span>
                <Link href="/login" className="text-[#111111] underline">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}