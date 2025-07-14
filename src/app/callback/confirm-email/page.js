"use client";
import { useSearchParams } from "next/navigation";
import ConfirmEmail from "@/components/auth/confirm-email";

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || searchParams.get("token");

  if (!code) {
    return <ConfirmEmail status="error" message="Invalid or missing confirmation code. Please check your email link or request a new confirmation email." />;
  }

  return <ConfirmEmail status="success" message="Your email address has been successfully verified. You can now log in and start using your account." />;
}
