"use client";

import { useState } from "react";
import { createClient } from "@/app/supabase/client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    // Set the redirect URL for password reset to /reset-password
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/callback/forgot-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage("If this email is registered, a password reset link has been sent.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <label className="text-[#666666] text-sm font-medium">Enter your email address</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full h-10 rounded-xl border border-[#666666]/30 text-[#666666] text-sm px-4 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none"
        placeholder="Email address"
        required
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className={`w-full h-10 rounded-3xl font-semibold text-white text-md shadow-md ${loading ? 'bg-[#2e3105]/50 cursor-not-allowed' : 'bg-[#2e3105] hover:bg-[#3e4310] active:scale-95'}`}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
      {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
}
