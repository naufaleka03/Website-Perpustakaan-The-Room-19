"use client";

import LandingHeader from "@/components/layout/landing-header";
import ForgotPasswordForm from "@/components/auth/forgot-password";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#232310] to-[#5f5f2c]">
      <LandingHeader />
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center w-full max-w-md shadow-lg rounded-xl bg-white/90 backdrop-blur-md p-8 md:p-10">
          <h1 className="text-black text-2xl font-medium mb-4">Forgot Password</h1>
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
} 