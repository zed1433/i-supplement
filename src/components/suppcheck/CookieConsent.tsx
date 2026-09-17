import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useConsent } from "@/lib/consent";
import { useT } from "@/lib/market";

const CATEGORIES = [
  {
    key: "preferences" as const,
    title: "Preferences",
    body: "Remembers your delivery region so prices and shipping are shown for the right country.",
  },
  {
    key: "affiliate" as const,
    title: "Affiliate measurement",
    body: "Adds a per-click reference to retailer links so a purchase can be credited to us. Retailers set their own cookies once you arrive.",
  },
  {
    key: "analytics" as const,
    title: "Analytics",
    body: "Aggregated, region-level usage counts that help us see which comparisons are useful. Never sold or shared for advertising.",
  },
];

export function CookieConsent() {
  const { consent, ready, panelOpen, openPanel, closePanel, acceptAll, rejectNonEssential, save } =
    useConsent();
  const [draft, setDraft] = useState({ preferences: true, affiliate: true, analytics: false });

  useEffect(() => {
    if (panelOpen) {
      setDraft({
        preferences: consent?.preferences ?? true,
        affiliate: consent?.affiliate ?? true,
        analytics: consent?.analytics ?? false,
      });
    }
  }, [panelOpen, consent]);

  const showBanner = ready && !consent;

  return (
    <>
      {showBanner && (
        <div className="fixed inset-x-0 bottom-16 z-50 px-3 pb-3 md:bottom-0 md:px-4 md:pb-4">
          <div className="mx-auto flex max-w-[1100px] flex-col gap-3 rounded-lg border border-border bg-surface/98 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Cookie className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                We use essential storage to keep the site working (region, basket, sign-in) and
                would like your consent for optional preferences, affiliate measurement and
                analytics.{" "}
                <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
                  Privacy policy
                </Link>
                .
              </span>
            </p>
            <div className="flex flex-wrap gap-2 sm:ml-auto sm:flex-nowrap">
              <Button type="button" size="sm" variant="outline" onClick={openPanel}>
                {t("consent.customize")}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={rejectNonEssential}>
                {t("consent.reject")}
              </Button>
              <Button type="button" size="sm" onClick={acceptAll}>
                {t("consent.acceptAll")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={panelOpen} onOpenChange={(open) => (open ? openPanel() : closePanel())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cookie settings</DialogTitle>
            <DialogDescription>
              Choose what we may store in your browser. You can change this at any time from the
              footer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Strictly necessary</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Your basket, sign-in session and security. Always on — the site cannot work
                  without it.
                </p>
              </div>
              <Switch checked disabled aria-label="Strictly necessary (always on)" />
            </div>

            {CATEGORIES.map((category) => (
              <div
                key={category.key}
                className="flex items-start justify-between gap-4 rounded-md border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{category.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {category.body}
                  </p>
                </div>
                <Switch
                  checked={draft[category.key]}
                  onCheckedChange={(checked) =>
                    setDraft((prev) => ({ ...prev, [category.key]: checked }))
                  }
                  aria-label={category.title}
                />
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={rejectNonEssential}>
              {t("consent.reject")}
            </Button>
            <Button type="button" onClick={() => save(draft)}>
              {t("consent.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
