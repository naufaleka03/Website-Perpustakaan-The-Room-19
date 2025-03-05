'use client';

import Link from 'next/link';
import { FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useState } from 'react';
import { logInWithEmail } from '@/app/lib/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LogIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { user, userType, userData } = await logInWithEmail(email, password);
            
            // Redirect based on user type
            switch (userType) {
                case 'visitor':
                    router.push('/user/dashboard');
                    break;
                case 'staff':
                    router.push('/staff/dashboard');
                    break;
                case 'owner':
                    router.push('/owner/dashboard');
                    break;
                default:
                    throw new Error('Invalid user type');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-start bg-white pt-16 pb-8 h-[calc(100vh-72px)]">
            <div className="flex flex-col items-center gap-6 w-full max-w-[1000px]">
                {/* Logo and Title */}
                <div className="flex flex-col items-center gap-3">
                    <Image
                        src="/the-room-19.jpg"
                        width={56}
                        height={52}
                        className="rounded-full"
                        alt="The Room 19 independent library logo"
                    />
                    <h1 className="text-black text-2xl font-medium">Welcome to The Room 19</h1>
                </div>

                {/* Login Forms Container */}
                <div className="flex items-start">
                    {/* Email/Password Login Form */}
                    <div className="w-96 p-4">
                        <form onSubmit={handleLogin} className="flex flex-col items-center gap-2">
                            <h2 className="text-black text-lg font-medium">Login</h2>
                            
                            {/* Email Input */}
                            <div className="w-full space-y-1">
                                <label className="text-gray-500 text-sm">Email address</label>
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-10 rounded-xl border border-gray-500/30 text-gray-500 text-sm px-4"
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className="w-full space-y-1">
                                <div className="flex justify-between">
                                    <label className="text-gray-500 text-sm">Password</label>
                                    <button className="mr-2 text-gray-500/80 text-sm flex items-center">
                                    <FaEyeSlash className="mr-1 scale-x-[-1]" />Hide
                                    </button>
                                </div>
                                <input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-10 rounded-xl border border-gray-500/30 text-gray-500 px-4"
                                    required
                                />
                            </div>

                            {/* Login Button */}
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className={`w-full h-10 mt-3 rounded-3xl transition-all duration-300 ${
                                    isLoading 
                                        ? 'bg-[#2e3105]/50 cursor-not-allowed' 
                                        : 'bg-[#2e3105] hover:bg-[#3e4310]'
                                }`}
                            >
                                <span className="text-white text-md font-medium">
                                    {isLoading ? 'Logging in...' : 'Continue'}
                                </span>
                            </button>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </form>
                    </div>

                    {/* Divider */}
                    <div className="flex flex-col items-center justify-center h-56 relative">
                        <div className="absolute top-0 bottom-0 w-0.5 bg-[#666666]/25" />
                        <div className="bg-white px-4 py-2 z-10">
                            <span className="text-black text-sm">OR</span>
                        </div>
                    </div>

                    {/* Social Login Options */}
                    <div className="w-96 p-8 mt-4">
                        <div className="flex flex-col items-center gap-3 mt-[50px]">
                            {/* Google Login */}
                            <button className="w-full h-10 bg-white rounded-3xl border border-[#333333] transition-colors hover:bg-gray-50 flex items-center justify-center gap-2">
                                <FcGoogle size={24} />
                                <span className="text-[#333333] text-md">Continue with Google</span>
                            </button>

                            {/* Facebook Login */}
                            <button className="w-full h-10 bg-[#1877F2] rounded-3xl border border-[#1877F2] transition-opacity hover:opacity-90 flex items-center justify-center gap-2">
                                <FaFacebook size={24} className="text-white" />
                                <span className="text-white text-md">Continue with Facebook</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Signup link */}
                <div className="flex flex-col items-center gap-1 mt-2">
                  <p className="text-sm text-gray-500">Don't have an account?</p>
                  <p className="text-sm text-gray-500"><Link href="/signup" className="text-sm text-[#111111] underline">Sign up</Link> here</p>
                </div>
            </div>
        </div>
    );
}