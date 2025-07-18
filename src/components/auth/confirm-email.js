import Link from "next/link";
import { Suspense } from "react";

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

function ConfirmEmailContent({ status, message }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232310] to-[#5f5f2c]">
      <div className="flex flex-col items-center w-full max-w-md shadow-lg rounded-xl bg-white/90 backdrop-blur-md p-8 md:p-10">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="bg-green-100 p-3 rounded-full">
            {/* Success checkmark icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-[#111010] font-manrope text-center">
            {status === "success" ? "Email Confirmed!" : "Email Confirmation Failed"}
          </h2>
        </div>
        <p className="text-[#666666] mb-4 text-center max-w-xl">
          {message}
        </p>
        <Link
          href="/login"
          className="w-full mt-4 h-[45px] bg-[#2e3105] text-white rounded-3xl text-base font-semibold font-manrope flex items-center justify-center gap-2 transition hover:bg-[#404615]"
        >
          Go to Login
        </Link>
        <div className="mt-6 text-xs text-[#666666]/80 text-center">
          Didn&apos;t request this? Please ignore this page.
        </div>
      </div>
    </div>
  );
}

export default function ConfirmEmail(props) {
  return (
    <Suspense fallback={<ConfirmEmailSkeleton />}>
      <ConfirmEmailContent {...props} />
    </Suspense>
  );
}
