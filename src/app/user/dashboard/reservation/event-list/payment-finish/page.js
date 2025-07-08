"use client";

import { Suspense } from "react";
import PaymentFinishEvent from "@/components/payment/payment-finish-event";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFinishEvent />
    </Suspense>
  );
}
