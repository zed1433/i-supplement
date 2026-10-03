import { Link } from "@tanstack/react-router";
import { ExternalLink, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ProductImage } from "@/components/suppcheck/ProductImage";
import { useBasket, type BasketItem } from "@/lib/basket";
import { useAffiliateHref, useConsent } from "@/lib/consent";
import { useMarket, useMoney } from "@/lib/market";
import { multiCart, retailerGroupKey } from "@/lib/retailerCart";
import { AFFILIATE_DISCLOSURE } from "@/lib/suppcheck";

export function UniversalCartDrawer() {
  const { items, totalItems, drawerOpen, closeDrawer, removeOffer, setQuantity } = useBasket();
  const { market } = useMarket();
  const money = useMoney();
  const affiliateHref = useAffiliateHref();
  const { consent } = useConsent();
  const groups = Object.values(items.reduce<Record<string, BasketItem[]>>((all, item) => {
    (all[retailerGroupKey(item)] ??= []).push(item);
    return all;
  }, {}));

  return (
    <Sheet open={drawerOpen} onOpenChange={(open) => { if (!open) closeDrawer(); }}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border p-5 pr-12 text-left">
          <SheetTitle>Universal Cart ({totalItems})</SheetTitle>
          <SheetDescription>Items are grouped by retailer. You complete payment on each retailer’s site.</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-4 sm:p-5">
          {!items.length && <div className="py-16 text-center"><ShoppingBasket className="mx-auto size-9 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">Your Universal Cart is empty.</p></div>}
          {groups.map((group) => {
            const merchant = group[0]?.merchantName ?? "Retailer";
            const cart = multiCart(group, market, consent?.affiliate ?? false);
            const groupedHref = cart.url;
            const total = group.reduce((sum, item) => sum + item.price * item.quantity, 0);
            return (
              <section key={retailerGroupKey(group[0] as BasketItem)} className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold">{merchant} Cart ({group.length} item{group.length === 1 ? "" : "s"})</h3><p className="num mt-1 text-xs text-muted-foreground">{money(total, group[0]?.currency)}</p></div>{groupedHref && <Button asChild size="sm"><a href={groupedHref} rel="nofollow sponsored" target="_blank">Continue on {merchant} <ExternalLink /></a></Button>}</div>
                <div className="mt-3 divide-y divide-border border-y border-border">
                  {group.map((item) => <div key={item.offerId} className="grid grid-cols-[48px_minmax(0,1fr)] gap-3 py-3"><ProductImage src={item.imageUrl} alt={item.productName} brand={item.brandName} className="size-12" /><div className="min-w-0"><p className="truncate text-sm font-medium">{item.productName}</p><p className="num text-xs text-primary">{money(item.price, item.currency)}</p><div className="mt-2 flex items-center justify-between"><div className="flex min-h-11 items-center rounded-md border border-border"><Button size="icon" variant="ghost" aria-label="Decrease quantity" onClick={() => setQuantity(item.offerId, item.quantity - 1)}><Minus /></Button><span className="num w-6 text-center text-xs">{item.quantity}</span><Button size="icon" variant="ghost" aria-label="Increase quantity" onClick={() => setQuantity(item.offerId, item.quantity + 1)}><Plus /></Button></div><div className="flex gap-1"><Button asChild size="icon" variant="outline"><a href={affiliateHref(item.offerId, item.targetUrl)} rel="nofollow sponsored" target="_blank" aria-label={`Open ${item.productName} on ${merchant}`}><ExternalLink /></a></Button><Button size="icon" variant="ghost" aria-label={`Remove ${item.productName}`} onClick={() => removeOffer(item.offerId)}><Trash2 /></Button></div></div></div></div>)}
                </div>
                {!groupedHref && <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">A verified multi-item cart is unavailable for this group. Open each product above to add it on {merchant}.</p>}
                {groupedHref && <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">Amazon will show these items and quantities, then ask you to confirm before adding them to your Amazon basket.</p>}
                {groupedHref && cart.excluded.length > 0 && <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{cart.excluded.length} item{cart.excluded.length === 1 ? "" : "s"} can’t join that cart link yet — open {cart.excluded.length === 1 ? "it" : "them"} above on {merchant}.</p>}
              </section>
            );
          })}
          <p className="text-[10px] leading-relaxed text-muted-foreground">{AFFILIATE_DISCLOSURE}</p>
          {items.length > 0 && <Button asChild variant="outline" className="w-full"><Link to="/basket" onClick={closeDrawer}>Open full basket</Link></Button>}
        </div>
      </SheetContent>
    </Sheet>
  );
}