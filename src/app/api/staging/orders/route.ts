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
import { stagingOrderSchema } from "@/lib/staging";
export async function GET() {
  try {
    const { db } = await staff();
    const { data, error } = await db
      .from("orders")
      .select(
        "id,branch_id,mode,preferred_date,request_state,payment_state,fulfillment_state,total_centavos,fee_centavos,payment_method,version",
      )
      .eq("is_staging", true)
      .order("created_at", { ascending: false })
      .limit(50);
    databaseError(error);
    return privateJson({ orders: data });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    limit(request, "create", 15);
    const { db } = await staff();
    const parsed = stagingOrderSchema.safeParse(await jsonBody(request));
    if (!parsed.success)
      throw new HttpError(
        400,
        parsed.error.issues.map((i) => i.message).join(" "),
      );
    const { data, error } = await db.rpc("create_staging_order", {
      payload: parsed.data,
    });
    databaseError(error);
    return privateJson({ orderId: data, staging: true }, 201);
  } catch (e) {
    return failure(e);
  }
}
