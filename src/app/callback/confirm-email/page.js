"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ConfirmEmail from "@/components/auth/confirm-email";

function ConfirmEmailSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232310] to-[#5f5f2c]">
      <div className="flex flex-col items-center w-full max-w-md shadow-lg rounded-xl bg-white/90 backdrop-blur-md p-8 md:p-10 animate-pulse">
        <div className="h-8 w-2/3 bg-gray-300 rounded mb-4" />
        <div className="h-10 bg-gray-200 rounded-xl mb-2 w-full" />
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<ConfirmEmailSkeleton />}>
      <ConfirmEmail />
    </Suspense>
  );
}
