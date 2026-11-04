import { z } from "zod";
import { checkoutSchema } from "./commerce";
export const stagingOrderSchema = z
  .object({
    idempotencyKey: z.uuid(),
    branchId: z.uuid(),
    zoneId: z.uuid().optional(),
    lines: z
      .array(
        z.object({
          productId: z.uuid(),
          quantity: z.number().int().min(1).max(20),
          message: z.string().max(300).default(""),
        }),
      )
      .min(1)
      .max(20),
    contact: checkoutSchema,
    instructions: z.string().max(500).default(""),
    fictionalDetails: z.literal(true),
  })
  .superRefine((v, c) => {
    if (v.contact.mode === "delivery" && !v.zoneId)
      c.addIssue({
        code: "custom",
        path: ["zoneId"],
        message: "Select a delivery zone.",
      });
  });
export const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.enum([
      "approve",
      "confirm",
      "preparing",
      "ready_for_pickup",
      "out_for_delivery",
      "completed",
      "record_cash",
    ]),
    version: z.number().int().nonnegative(),
  }),
  z.object({
    action: z.literal("quote"),
    version: z.number().int().nonnegative(),
    amount: z.number().int().positive().max(100000000),
  }),
  z.object({
    action: z.literal("verify_payment"),
    version: z.number().int().nonnegative(),
    paymentId: z.uuid(),
  }),
]);
export const trackingSchema = z.object({
  orderId: z.uuid(),
  token: z.string().regex(/^[a-f0-9]{64}$/),
});
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const expected = new URL(request.url);
    // Next.js may normalize request.url to its internal listen hostname.
    // Host is the browser's requested authority; compare scheme as well.
    expected.host = request.headers.get("host") || expected.host;
    return new URL(origin).origin === expected.origin;
  } catch {
    return false;
  }
}

export type StageOrder = {
  id: string;
  branch_id: string;
  mode: string;
  preferred_date: string;
  request_state: string;
  payment_state: string;
  fulfillment_state: string;
  total_centavos: number | null;
  fee_centavos: number;
  payment_method: string;
  version: number;
};
