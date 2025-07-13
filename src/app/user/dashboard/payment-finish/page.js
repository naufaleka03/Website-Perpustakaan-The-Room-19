'use client';

import { Suspense } from "react";
import PaymentFinishPage from "@/components/payment/payment-finish";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFinishPage />
    </Suspense>
  );
}

