import type { Product } from "@/api/types";

export type { Product };

export function productLabel(product: Product): string {
  return product === "website" ? "Website" : "Soccer";
}

export function productBasePath(product: Product): string {
  return `/${product}`;
}

/** URL segment under /api/ (soccer product uses balon). */
export function productApiPrefix(product: Product): string {
  return product === "soccer" ? "balon" : product;
}
