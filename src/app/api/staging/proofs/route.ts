import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  staff,
  sameOrigin,
  privateJson,
  failure,
  HttpError,
  databaseError,
  limit,
  boundedBytes,
} from "@/lib/server/access";
import { sanitizeProof } from "@/lib/server/proof";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    limit(request, "upload", 10);
    const { db } = await staff();
    if (
      !request.headers.get("content-type")?.startsWith("multipart/form-data;")
    )
      throw new HttpError(400, "Choose a PNG or JPEG image to upload.");
    const bytes = await boundedBytes(request, 6 * 1024 * 1024);
    const form = await new Response(bytes, {
      headers: { "Content-Type": request.headers.get("content-type") || "" },
    }).formData();
    const file = form.get("file");
    const id = String(form.get("orderId"));
    const amount = Number(form.get("amount"));
    if (
      !(file instanceof File) ||
      !z.uuid().safeParse(id).success ||
      !Number.isSafeInteger(amount) ||
      amount <= 0
    )
      throw new HttpError(
        400,
        "Select an order, image and amount in centavos.",
      );
    const { data: order, error } = await db
      .from("orders")
      .select("id,request_state,total_centavos,payment_method")
      .eq("id", id)
      .eq("is_staging", true)
      .maybeSingle();
    databaseError(error);
    if (!order) throw new HttpError(404, "Not found");
    if (
      order.request_state !== "awaiting_payment" ||
      order.payment_method === "Cash"
    )
      throw new HttpError(409, "Approve a transfer-payment test order first.");
    let clean: Buffer;
    try {
      clean = await sanitizeProof(
        Buffer.from(await file.arrayBuffer()),
        file.type,
      );
    } catch {
      throw new HttpError(
        400,
        "Choose a valid single PNG or JPEG image, up to 5 MB and 20 megapixels.",
      );
    }
    const path = `${id}/${randomUUID()}.jpg`;
    const { error: uploadError } = await db.storage
      .from("payment-proofs")
      .upload(path, clean, { contentType: "image/jpeg", upsert: false });
    if (uploadError)
      throw new HttpError(
        409,
        "Private upload failed. Check storage configuration and retry.",
      );
    const { error: recordError } = await db.rpc("register_staging_proof", {
      order_id: id,
      storage_path: path,
      bytes: clean.length,
      amount,
    });
    if (recordError) {
      await db.storage.from("payment-proofs").remove([path]);
      databaseError(recordError);
    }
    return privateJson(
      {
        status: "submitted",
        message:
          "Proof saved for manual review. Payment is not automatically verified.",
      },
      201,
    );
  } catch (e) {
    return failure(e);
  }
}
export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!z.uuid().safeParse(id).success) throw new HttpError(404, "Not found");
    const { db } = await staff();
    const { data: file, error } = await db
      .from("payment_proof_files")
      .select("storage_path,payment_records!inner(orders!inner(is_staging))")
      .eq("id", id!)
      .eq("payment_records.orders.is_staging", true)
      .maybeSingle();
    databaseError(error);
    if (!file) throw new HttpError(404, "Not found");
    const { data, error: signError } = await db.storage
      .from("payment-proofs")
      .createSignedUrl(file.storage_path, 60);
    if (signError) throw new HttpError(409, "Could not open private proof.");
    return privateJson({ url: data.signedUrl, expiresInSeconds: 60 });
  } catch (e) {
    return failure(e);
  }
}
