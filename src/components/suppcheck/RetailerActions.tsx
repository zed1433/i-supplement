import { RetailerOfferRows } from "@/components/suppcheck/RetailerOfferRows";
import { type Product } from "@/lib/suppcheck";

export function RetailerActions({ product, compact = false }: { product: Product; compact?: boolean }) {
  return <RetailerOfferRows product={product} compact={compact} />;
}