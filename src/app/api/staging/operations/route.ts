import { z } from "zod";
import {
  staff,
  sameOrigin,
  privateJson,
  failure,
  HttpError,
  databaseError,
  jsonBody,
  limit,
} from "@/lib/server/access";
const schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("cutoff"),
    branch: z.uuid(),
    cutoff: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  }),
  z.object({
    kind: z.literal("inventory"),
    branch: z.uuid(),
    product: z.uuid(),
    available: z.boolean(),
    quantity: z.number().int().min(0).max(10000).nullable(),
  }),
]);
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    limit(request, "operations");
    const { db, profile } = await staff();
    if (profile.role !== "owner")
      throw new HttpError(403, "Owner access required.");
    const parsed = schema.safeParse(await jsonBody(request));
    if (!parsed.success) throw new HttpError(400, "Invalid staging setting.");
    const v = parsed.data;
    const { error } = await db.rpc("set_staging_operations", {
      branch: v.branch,
      cutoff: v.kind === "cutoff" ? v.cutoff : null,
      product: v.kind === "inventory" ? v.product : null,
      available: v.kind === "inventory" ? v.available : null,
      quantity: v.kind === "inventory" ? v.quantity : null,
    });
    databaseError(error);
    return privateJson({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
