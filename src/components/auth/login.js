'use client';

import Link from 'next/link';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/app/supabase/client';
import { logInWithEmail } from '@/app/lib/auth';

export default function LogIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [skeleton, setSkeleton] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const timer = setTimeout(() => setSkeleton(false), 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { user } = session;
                const tables = ['visitors', 'staff', 'owners'];
                for (const table of tables) {
                    const { data } = await supabase
                        .from(table)
                        .select('id')
                        .eq('id', user.id)
                        .single();
                    if (data) {
                        const userType = table.slice(0, -1);
                        const dashboardPath = `/${userType === 'visitor' ? 'user' : userType}/dashboard`;
                        router.push(dashboardPath);
                        break;
                    }
                }
            }
        };
        checkSession();
    }, [router]);

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address.';
        }
        if (!password) {
            newErrors.password = 'Password is required.';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);
        try {
            const { user, userType, userData } = await logInWithEmail(email, password);
            const urlParams = new URLSearchParams(window.location.search);
            const redirectPath = urlParams.get('redirect');
            if (redirectPath) {
                router.replace(redirectPath);
            } else {
                let dashboardPath;
                switch (userType) {
                    case 'visitor':
                        dashboardPath = '/user/dashboard';
                        break;
                    case 'staff':
                        dashboardPath = '/staff/dashboard';
                        break;
                    case 'owner':
                        dashboardPath = '/owner/dashboard';
                        break;
                    default:
                        throw new Error('Invalid user type');
                }
                router.replace(dashboardPath);
            }
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232310] to-[#5f5f2c]">
            <div className="flex flex-col items-center w-full max-w-md shadow-lg rounded-xl bg-white/90 backdrop-blur-md p-8 md:p-10">
                {/* Logo and Title */}
                <div className="flex flex-col items-center gap-3 mb-4">
                    {skeleton ? (
                        <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse" />
                    ) : (
                        <Image
                            src="/the-room-19.jpg"
                            width={56}
                            height={52}
                            className="rounded-full"
                            alt="The Room 19 independent library logo"
                        />
                    )}
                    <h1 className="text-black text-2xl font-medium">Welcome to The Room 19</h1>
                </div>
                {/* Login Form */}
                <form onSubmit={handleLogin} className="flex flex-col items-center gap-4 w-full">
                    <h2 className="text-black text-lg font-medium">Login</h2>
                    {/* Email Input */}
                    <div className="w-full">
                        <label className="block text-[#666666] text-sm font-medium mb-1">Email address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: undefined }); }}
                            className={`w-full h-10 rounded-xl border ${errors.email ? 'border-red-500' : 'border-[#666666]/30'} text-[#666666] text-sm px-4 transition-all duration-200 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none hover:border-[#2e3105]/50`}
                            placeholder="Enter your email address"
                            autoComplete="email"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-[#666666]/80 mt-1">Enter the email you used to register</p>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    {/* Password Input */}
                    <div className="w-full">
                        <div className="flex justify-between items-center">
                            <label className="block text-[#666666] text-sm font-medium mb-1">Password</label>
                            <button type="button" tabIndex={-1} className="mr-2 text-gray-500/80 text-sm flex items-center hover:text-[#2e3105]" onClick={() => setShowPassword(v => !v)}>
                                {showPassword ? <FaEye className="mr-1" /> : <FaEyeSlash className="mr-1 scale-x-[-1]" />} {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: undefined }); }}
                            className={`w-full h-10 rounded-xl border ${errors.password ? 'border-red-500' : 'border-[#666666]/30'} text-[#666666] text-sm px-4 transition-all duration-200 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none hover:border-[#2e3105]/50`}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-[#666666]/80 mt-1">Password must be at least 8 characters</p>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full h-10 mt-3 rounded-3xl transition-all duration-300 font-semibold text-white text-md shadow-md ${isLoading ? 'bg-[#2e3105]/50 cursor-not-allowed' : 'bg-[#2e3105] hover:bg-[#3e4310] active:scale-95'}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Logging in...</span>
                        ) : (
                            <span>Continue</span>
                        )}
                    </button>
                    {errors.submit && <p className="text-red-500 text-sm text-center mt-2">{errors.submit}</p>}
                </form>
                {/* Signup link */}
                <div className="flex flex-col items-center gap-1 mt-4">
                    <p className="text-sm text-gray-500">Don't have an account?</p>
                    <p className="text-sm text-gray-500"><Link href="/signup" className="text-sm text-[#111111] underline hover:text-[#2e3105]">Sign up</Link> here</p>
                    <p className="text-sm text-gray-500 mt-2">
                        <Link href="/login/forgot-password" className="text-sm text-[#111111] underline hover:text-[#2e3105]">Forgot Password?</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}