"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/app/supabase/client";

function ForgotPasswordSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232310] to-[#5f5f2c]">
      <div className="flex flex-col items-center w-full max-w-md shadow-lg rounded-xl bg-white/90 backdrop-blur-md p-8 md:p-10 animate-pulse">
        <div className="h-8 w-2/3 bg-gray-300 rounded mb-4" />
        <div className="flex flex-col gap-4 w-full">
          <div className="h-10 bg-gray-200 rounded-xl mb-2" />
          <div className="h-10 bg-gray-200 rounded-xl mb-2" />
          <div className="h-10 bg-gray-300 rounded-3xl mb-2" />
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordFormContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const token = searchParams.get("code");

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Your password has been reset. You can now log in with your new password.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232310] to-[#5f5f2c]">
        <div className="flex flex-col items-center w-full max-w-md shadow-lg rounded-xl bg-white/90 backdrop-blur-md p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-[#111010] font-manrope text-center mb-4">Invalid or Missing Token</h2>
          <p className="text-[#666666] mb-4 text-center max-w-xl">The password reset link is invalid or expired. Please request a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232310] to-[#5f5f2c]">
      <div className="flex flex-col items-center w-full max-w-md shadow-lg rounded-xl bg-white/90 backdrop-blur-md p-8 md:p-10">
        <h2 className="text-2xl font-semibold text-[#111010] font-manrope text-center mb-4">Reset Your Password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="password"
            placeholder="New password"
            className="w-full h-10 rounded-xl border border-[#666666]/30 text-[#666666] text-sm px-4 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full h-10 rounded-xl border border-[#666666]/30 text-[#666666] text-sm px-4 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-10 rounded-3xl font-semibold text-white text-md shadow-md ${loading ? 'bg-[#2e3105]/50 cursor-not-allowed' : 'bg-[#2e3105] hover:bg-[#3e4310] active:scale-95'}`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
        </form>
      </div>
    </div>
  );
}

export default function ForgotPasswordForm() {
  return (
    <Suspense fallback={<ForgotPasswordSkeleton />}>
      <ForgotPasswordFormContent />
    </Suspense>
  );
} 