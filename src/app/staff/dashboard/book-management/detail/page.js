import { Suspense } from "react";
import DetailStaff, { DetailLoadingSkeleton } from "@/components/staff/book-management/detail-staff";

export default function StaffBookDetail() {
  return (
    <Suspense fallback={<DetailLoadingSkeleton />}>
      <DetailStaff />
    </Suspense>
  );
} 