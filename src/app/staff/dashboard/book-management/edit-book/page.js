import { Suspense } from "react";
import EditBook from "@/components/staff/book-management/edit-book";
import { EditBookSkeleton } from "@/components/staff/book-management/edit-book";

export default function StaffEditBook() {
  return (
    <Suspense fallback={<EditBookSkeleton />}>
      <EditBook />
    </Suspense>
  );
} 