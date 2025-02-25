import Link from 'next/link';
import { FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";

export default function LogInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white py-20">
            <div className="flex flex-col items-center gap-10 w-full max-w-[1000px]">
                {/* Logo and Title */}
                <div className="mt-11 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-[#c4c4c4] rounded-full" />
                    <h1 className="text-[#333333] text-[40px] font-medium">Log in</h1>
                </div>

                {/* Login Forms Container */}
                <div className="flex items-start gap-6">
                    {/* Email/Password Login Form */}
                    <div className="w-[482px] p-9">
                        <div className="flex flex-col items-center gap-6">
                            <h2 className="text-[#111111] text-2xl font-medium">Log in</h2>
                            
                            {/* Email Input */}
                            <div className="w-full space-y-1">
                                <label className="text-[#666666] text-base">Email address</label>
                                <input 
                                    type="email"
                                    className="w-full h-14 rounded-xl border border-[#666666]/30 px-4"
                                />
                            </div>

                            {/* Password Input */}
                            <div className="w-full space-y-1">
                                <div className="flex justify-between">
                                    <label className="text-[#666666] text-base">Password</label>
                                    <button className="mr-2 text-[#666666]/80 text-lg flex items-center">
                                    <FaEyeSlash className="mr-1 scale-x-[-1]" />Hide
                                    </button>

                                </div>
                                <input 
                                    type="password"
                                    className="w-full h-14 rounded-xl border border-[#666666]/30 px-4"
                                />
                            </div>

                            {/* Login Button */}
                            <button className="w-full h-14 bg-[#C4C4C4] rounded-[32px] transition-opacity hover:opacity-90">
                                <span className="text-white text-[22px] font-medium">Log in</span>
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex flex-col items-center justify-center h-[451px] relative">
                        <div className="absolute top-0 bottom-0 w-0.5 bg-[#666666]/25" />
                        <div className="bg-white px-4 py-2 z-10">
                            <span className="text-[#333333] text-base">OR</span>
                        </div>
                    </div>

                    {/* Social Login Options */}
                    <div className="w-[482px] p-10">
                        <div className="flex flex-col items-center gap-6 mt-[74px]">
                            {/* Google Login */}
                            <button className="w-full h-14 bg-white rounded-[40px] border border-[#333333] transition-colors hover:bg-gray-50 flex items-center justify-center gap-2">
                                <FcGoogle size={24} />
                                <span className="text-[#333333] text-[22px]">Continue with Google</span>
                            </button>

                            {/* Facebook Login */}
                            <button className="w-full h-14 bg-[#1877F2] rounded-[40px] border border-[#1877F2] transition-opacity hover:opacity-90 flex items-center justify-center gap-2">
                                <FaFacebook size={24} className="text-white" />
                                <span className="text-white text-[22px]">Continue with Facebook</span>
                            </button>

                            {/* Email Signup */}
                            <button className="w-full h-14 rounded-[40px] border border-[#111111] transition-colors hover:bg-gray-50 flex items-center justify-center">
                                <IoMdMail size={24} className='mr-3 text-[#111111]'></IoMdMail>
                                <span className="text-[#333333] text-[22px]">Sign up with email</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="flex flex-col items-center gap-6">
                    <Link href="#" className="text-[#111111] text-base font-medium underline">
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