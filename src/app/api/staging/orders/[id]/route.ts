import { createHash, randomBytes } from "node:crypto";
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
import { actionSchema } from "@/lib/staging";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!z.uuid().safeParse(id).success) throw new HttpError(404, "Not found");
    const { db } = await staff();
    const { data: order, error } = await db
      .from("orders")
      .select(
        "id,branch_id,mode,preferred_date,request_state,payment_state,fulfillment_state,total_centavos,fee_centavos,payment_method,version",
      )
      .eq("id", id)
      .eq("is_staging", true)
      .maybeSingle();
    databaseError(error);
    if (!order) throw new HttpError(404, "Not found");
    const { data: payments, error: pe } = await db
      .from("payment_records")
      .select("id,amount_centavos,state,verified_at,payment_proof_files(id)")
      .eq("order_id", id);
    databaseError(pe);
    const { data: events, error: ee } = await db
      .from("order_status_events")
      .select("id,old_state,new_state,created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false })
      .limit(30);
    databaseError(ee);
    return privateJson({ order, payments, events });
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    sameOrigin(request);
    limit(request, "change");
    const { id } = await params;
    if (!z.uuid().safeParse(id).success) throw new HttpError(404, "Not found");
    const { db } = await staff();
    const body = await jsonBody(request);
    if (body?.action === "tracking_link") {
      const token = randomBytes(32).toString("hex");
      const { error } = await db.rpc("rotate_staging_tracking", {
        order_id: id,
        token_hash: createHash("sha256").update(token).digest("hex"),
      });
      databaseError(error);
      return privateJson({
        path: `/status#id=${id}&token=${token}`,
        expiresInDays: 7,
      });
    }
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(400, "Invalid action.");
    const value = parsed.data;
    const { error } = await db.rpc("change_staging_order", {
      order_id: id,
      expected_version: value.version,
      action: value.action,
      amount: "amount" in value ? value.amount : null,
      payment_id: "paymentId" in value ? value.paymentId : null,
    });
    databaseError(error);
    return privateJson({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
