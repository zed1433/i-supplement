import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MerchantOffer, Product } from "@/lib/suppcheck";
import { productImageUrl } from "@/lib/productImages";

const STORAGE_KEY = "suppcheck-retailer-basket-v1";

export type BasketItem = {
  offerId: string;
  productId: string;
  productSlug: string;
  productName: string;
  brandName: string;
  imageUrl: string;
  merchantName: string;
  affiliateNetwork: string;
  retailerProductId: string;
  price: number;
  currency: string;
  inStock: boolean;
  quantity: number;
  /** When the retailer feed last refreshed this price (affiliate compliance). */
  priceCheckedAt?: string;
};

type BasketContextValue = {
  items: BasketItem[];
  totalItems: number;
  addOffer: (product: Product, offer: MerchantOffer) => void;
  removeOffer: (offerId: string) => void;
  setQuantity: (offerId: string, quantity: number) => void;
  hasOffer: (offerId: string) => boolean;
  clear: () => void;
};

const BasketContext = createContext<BasketContextValue | null>(null);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved) as BasketItem[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const addOffer = useCallback((product: Product, offer: MerchantOffer) => {
    setItems((current) => {
      const existing = current.find((item) => item.offerId === offer.id);
      let nextItems: BasketItem[];
      if (existing) {
        nextItems = current.map((item) =>
          item.offerId === offer.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      } else {
        nextItems = [
          ...current,
          {
            offerId: offer.id,
            productId: product.id,
            productSlug: product.slug,
            productName: product.name,
            brandName: product.brands.name,
            imageUrl: productImageUrl(product),
            merchantName: offer.merchant_name,
            affiliateNetwork: offer.affiliate_network,
            retailerProductId: offer.retailer_product_id,
            price: Number(offer.price),
            currency: offer.currency,
            inStock: offer.in_stock,
            quantity: 1,
            priceCheckedAt: offer.updated_at,
          },
        ];
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
      return nextItems;
    });
  }, []);

  const value = useMemo<BasketContextValue>(
    () => ({
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      addOffer,
      removeOffer: (offerId) => setItems((current) => current.filter((item) => item.offerId !== offerId)),
      setQuantity: (offerId, quantity) =>
        setItems((current) =>
          quantity < 1
            ? current.filter((item) => item.offerId !== offerId)
            : current.map((item) => (item.offerId === offerId ? { ...item, quantity } : item)),
        ),
      hasOffer: (offerId) => items.some((item) => item.offerId === offerId),
      clear: () => setItems([]),
    }),
    [addOffer, items],
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) throw new Error("useBasket must be used inside BasketProvider");
  return context;
}