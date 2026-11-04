export async function POST() {
  return Response.json(
    {
      error:
        "Live order submission is disabled. This is a demo storefront; no order was saved.",
    },
    { status: 503 },
  );
}
