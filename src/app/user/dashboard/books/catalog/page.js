import { Suspense } from "react";
import Catalog from "@/components/user/books/catalog";
import { LoadingSkeleton } from "@/components/user/books/catalog";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Catalog />
    </Suspense>
  );
}
