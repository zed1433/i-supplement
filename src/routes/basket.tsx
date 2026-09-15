import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { Button } from "@/components/ui/button";
import { useBasket, type BasketItem } from "@/lib/basket";
import { formatPrice } from "@/lib/suppcheck";

export const Route = createFileRoute("/basket")({
  head: () => ({
    meta: [
      { title: "Multi-Store Supplement Basket — i-Supplement" },
      { name: "description", content: "Review supplement offers grouped by retailer before continuing to checkout." },
      { property: "og:title", content: "Multi-Store Supplement Basket — i-Supplement" },
      { property: "og:description", content: "Review exact supplement offers grouped by retailer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BasketPage,
});

function BasketPage() {
  const { items, totalItems, removeOffer, setQuantity, clear } = useBasket();
  const groups = Object.entries(
    items.reduce<Record<string, BasketItem[]>>((grouped, item) => {
      (grouped[item.merchantName] ??= []).push(item);
      return grouped;
    }, {}),
  ).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-background pb-16">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Multi-store basket</p>
            <h1 className="mt-2 text-3xl font-semibold">Your retailer baskets</h1>
            <p className="mt-2 text-sm text-muted-foreground">{totalItems} item{totalItems === 1 ? "" : "s"}, grouped by checkout destination.</p>
          </div>
          {items.length > 0 && <Button variant="ghost" onClick={clear}><Trash2 /> Clear all</Button>}
        </div>

        {groups.length === 0 ? (
          <div className="py-24 text-center">
            <ShoppingBasket className="mx-auto size-10 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Your basket is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">Add an offer from any product in the catalogue.</p>
            <Button asChild className="mt-6"><Link to="/">Browse products</Link></Button>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {groups.map(([merchant, group]) => <MerchantGroup key={merchant} merchant={merchant} items={group} removeOffer={removeOffer} setQuantity={setQuantity} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function MerchantGroup({ merchant, items, removeOffer, setQuantity }: { merchant: string; items: BasketItem[]; removeOffer: (id: string) => void; setQuantity: (id: string, quantity: number) => void }) {
  const isAmazon = merchant === "Amazon.de" && items.every((item) => item.retailerProductId);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const checkoutHref = isAmazon
    ? `https://www.amazon.de/gp/aws/cart/add.html?${items.map((item, index) => `ASIN.${index + 1}=${encodeURIComponent(item.retailerProductId)}&Quantity.${index + 1}=${item.quantity}`).join("&")}&AssociateTag=suppcheck-21`
    : undefined;

  return (
    <section className="border-t border-border pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{merchant}</h2>
          <p className="num mt-1 text-xs text-muted-foreground">Estimated items total {formatPrice(total, items[0]?.currency ?? "EUR")}</p>
        </div>
        {checkoutHref && (
          <Button asChild><a href={checkoutHref} rel="nofollow sponsored">Prepare Amazon basket <ExternalLink /></a></Button>
        )}
      </div>
      <div className="mt-4 divide-y divide-border border-y border-border">
        {items.map((item) => (
          <div key={item.offerId} className="grid gap-4 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{item.brandName}</p>
              <Link to="/products/$slug" params={{ slug: item.productSlug }} className="mt-1 block font-semibold hover:text-primary">{item.productName}</Link>
              <p className="num mt-1 text-sm text-primary">{formatPrice(item.price, item.currency)} each</p>
            </div>
            <div className="flex h-9 items-center rounded-md border border-border">
              <Button size="icon" variant="ghost" aria-label="Decrease quantity" onClick={() => setQuantity(item.offerId, item.quantity - 1)}><Minus /></Button>
              <span className="num w-8 text-center text-sm">{item.quantity}</span>
              <Button size="icon" variant="ghost" aria-label="Increase quantity" onClick={() => setQuantity(item.offerId, item.quantity + 1)}><Plus /></Button>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline"><a href={`/api/affiliate/redirect/${item.offerId}`} rel="nofollow sponsored">Exact product <ExternalLink /></a></Button>
              <Button size="icon" variant="ghost" aria-label={`Remove ${item.productName}`} onClick={() => removeOffer(item.offerId)}><Trash2 /></Button>
            </div>
          </div>
        ))}
      </div>
      {!checkoutHref && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">This retailer does not provide a verified multi-item basket link. Open each exact product above to add it safely on the retailer’s website.</p>}
    </section>
  );
}