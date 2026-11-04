import { notFound } from "next/navigation";
import { products } from "@/lib/commerce";
import { ProductDetail } from "@/components/product-detail";
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.id }));
}
export default async function Product({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = products.find((p) => p.id === slug);
  if (!p) notFound();
  return <ProductDetail product={p} />;
}
