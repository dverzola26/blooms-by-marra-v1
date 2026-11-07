import type { Product } from "./commerce";

export const categories = [
  { id: "blooms", name: "Blooms" },
  { id: "local-roses", name: "Local Roses", parent: "blooms" },
  { id: "china-roses", name: "China Roses", parent: "blooms" },
  { id: "funeral-flowers", name: "Funeral Flowers" },
  { id: "inaugural-flowers", name: "Inaugural Flowers" },
] as const;

export function matchesCategory(product: Product, category: string) {
  if (category === "all") return true;
  if (category === "local-roses" || category === "china-roses") {
    return product.category === "blooms" && product.bloomType === category;
  }
  return product.category === category;
}
