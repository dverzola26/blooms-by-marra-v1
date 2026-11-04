import { redirect } from "next/navigation";
import { staff, HttpError } from "@/lib/server/access";
import { StaffWorkspace } from "@/components/staff-workspace";
export const dynamic = "force-dynamic";
export default async function Workspace() {
  let access;
  try {
    access = await staff();
  } catch (e) {
    if (e instanceof HttpError) redirect("/admin/login");
    throw e;
  }
  const { db, profile } = access;
  const [branches, products, zones] = await Promise.all([
    db
      .from("branches")
      .select("id,name,cutoff")
      .eq("is_staging", true)
      .eq("is_active", false),
    db
      .from("products")
      .select("id,name,price_centavos,custom_quote,branch_inventory(branch_id)")
      .eq("is_demo", true)
      .eq("is_active", false),
    db.from("service_zones").select("id,branch_id,city"),
  ]);
  if (branches.error || products.error || zones.error)
    return (
      <section className="section">
        <h1>Staging setup required</h1>
        <p>
          The database schema or staff permissions are not ready. Apply the
          staging migrations and seed before continuing.
        </p>
      </section>
    );
  return (
    <StaffWorkspace
      role={profile.role}
      branches={branches.data || []}
      products={products.data || []}
      zones={zones.data || []}
    />
  );
}
