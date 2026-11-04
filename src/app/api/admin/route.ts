import { staff, privateJson, failure } from "@/lib/server/access";
export async function GET() {
  try {
    const { profile } = await staff();
    return privateJson({
      role: profile.role,
      branchId: profile.branch_id,
      mode: "staging",
    });
  } catch (e) {
    return failure(e);
  }
}
