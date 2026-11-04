import { trackingSchema } from "@/lib/staging";
import {
  client,
  sameOrigin,
  privateJson,
  failure,
  HttpError,
  jsonBody,
  limit,
  databaseError,
} from "@/lib/server/access";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    limit(request, "tracking", 30);
    const parsed = trackingSchema.safeParse(await jsonBody(request, 2000));
    if (!parsed.success)
      throw new HttpError(404, "Tracking link is invalid or expired.");
    const { data, error } = await client().rpc("track_staging_order", {
      order_id: parsed.data.orderId,
      token: parsed.data.token,
    });
    databaseError(error);
    if (!data) throw new HttpError(404, "Tracking link is invalid or expired.");
    return privateJson({ status: data });
  } catch (e) {
    return failure(e);
  }
}
