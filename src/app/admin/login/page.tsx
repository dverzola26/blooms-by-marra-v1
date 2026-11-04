import { Login } from "@/components/staff-login";
import { stagingConfig } from "@/lib/server/access";
export const dynamic = "force-dynamic";
export default function StaffLogin() {
  let configured = false;
  try {
    stagingConfig();
    configured = true;
  } catch {}
  return (
    <section className="section info-page">
      <p className="eyebrow">PRIVATE STAGING WORKSPACE</p>
      <h1>Welcome back.</h1>
      <p>
        Staff access is limited to assigned roles and branches. Staging accepts
        fictional test details only. Live ordering and payments remain disabled.
      </p>
      <Login configured={configured} />
    </section>
  );
}
