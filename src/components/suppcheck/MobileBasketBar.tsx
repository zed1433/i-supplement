import { useRouterState } from "@tanstack/react-router";
import { ArrowRight, ShoppingBasket } from "lucide-react";
import { useBasket } from "@/lib/basket";
import { useMoney } from "@/lib/market";

export function MobileBasketBar() {
  const { items, totalItems, openDrawer } = useBasket();
  const money = useMoney();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (!totalItems) return null;
  const currencies = new Set(items.map((item) => item.currency));
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalLabel = currencies.size === 1 ? money(total, items[0]?.currency) : "Multiple currencies";
  if (pathname === "/basket") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <button
        type="button"
        onClick={openDrawer}
        className="mx-auto flex min-h-12 max-w-lg items-center justify-between rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
      >
        <span className="flex items-center gap-2"><ShoppingBasket className="size-5" /> {totalItems} item{totalItems === 1 ? "" : "s"}</span>
        <span className="flex items-center gap-2"><span className="num">{totalLabel}</span><ArrowRight className="size-4" /></span>
      </button>
    </div>
  );
}