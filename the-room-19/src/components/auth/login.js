import Link from 'next/link';
import { FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";

export default function LogIn() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white py-26">
            <div className="flex flex-col items-center gap-10 w-full max-w-[1000px]">
                {/* Logo and Title */}
                <div className="mt-11 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-[#c4c4c4] rounded-full" />
                    <h1 className="text-black text-2xl font-medium">Welcome to The Room 19</h1>
                </div>

                {/* Login Forms Container */}
                <div className="flex items-start">
                    {/* Email/Password Login Form */}
                    <div className="w-96 p-8">
                        <div className="flex flex-col items-center gap-2">
                            <h2 className="text-black text-lg font-medium">Login</h2>
                            
                            {/* Email Input */}
                            <div className="w-full space-y-1">
                                <label className="text-gray-500 text-sm">Email address</label>
                                <input 
                                    type="email"
                                    className="w-full h-10 rounded-xl border border-gray-500/30 text-gray-500 text-sm px-4"
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
                                    className="w-full h-10 rounded-xl border border-gray-500/30 text-gray-500 px-4"
                                />
                            </div>

                            {/* Login Button */}
                            <button className="w-full h-10 mt-3 bg-gray-300 rounded-3xl transition-opacity hover:opacity-90">
                                <span className="text-white text-md font-medium">Continue</span>
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex flex-col items-center justify-center h-72 relative">
                        <div className="absolute top-0 bottom-0 w-0.5 bg-[#666666]/25" />
                        <div className="bg-white px-4 py-2 z-10">
                            <span className="text-black text-sm">OR</span>
                        </div>
                    </div>

                    {/* Social Login Options */}
                    <div className="w-96 p-6">
                        <div className="flex flex-col items-center gap-3 mt-[74px]">
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

                            {/* Email Signup */}
                            <button className="w-full h-10 rounded-3xl border border-[#111111] transition-colors hover:bg-gray-50 flex items-center justify-center">
                                <IoMdMail size={24} className='mr-3 text-[#111111]'></IoMdMail>
                                <span className="text-[#333333] text-md">Sign up with email</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="flex flex-col items-center gap-1">
                    <Link href="#" className="text-[#111111] text-sm font-medium underline">
                        Can't log in?
                    </Link>
                    <div className="text-center text-sm max-w-[342px]">
                        <span className="text-[#666666]">Secure Login with reCAPTCHA subject to Google </span>
                        <Link href="#" className="text-[#333333] underline">Terms</Link>
                        <span className="text-[#666666]"> & </span>
                        <Link href="#" className="text-[#333333] underline">Privacy</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}