import { Suspense } from "react";
import { Catalog } from "@/components/catalog";
export default function Shop() {
  return (
    <Suspense fallback={<p className="section">Loading the collection…</p>}>
      <Catalog />
    </Suspense>
  );
}
