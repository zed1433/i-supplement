import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { OPERATOR_IDENTITY, PRICE_AUTHORITY_NOTE } from "@/lib/suppcheck";

export const Route = createFileRoute("/affiliate-disclosure")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Affiliate Disclosure — i-Supplement" },
      {
        name: "description",
        content:
          "How i-Supplement earns money, how retailer prices are sourced and refreshed, and what happens when you continue to a shop.",
      },
      { property: "og:title", content: "Affiliate Disclosure — i-Supplement" },
      {
        property: "og:description",
        content: "How i-Supplement earns money and how retailer prices are sourced.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DisclosurePage,
});

function DisclosurePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold">Affiliate disclosure</h1>
        <div className="mt-6 space-y-5 text-sm leading-relaxed text-foreground/90">
          <p>
            i-Supplement is an independent supplement comparison site. When you continue to a
            retailer from one of our links and buy something, we may earn a commission from that
            retailer. This never changes the price you pay, and it never changes where a product
            ranks in our comparisons — ranking is driven only by elemental yield, chemical form,
            certification and price.
          </p>
          <p>
            As an Amazon Associate, we earn from qualifying purchases. We also hold, or have applied
            for, affiliate relationships with the other retailers listed on this site — iHerb,
            Myprotein and Bulk Supplements — either directly or through affiliate networks such as
            Awin and Linkwise. Commission is paid by the retailer out of their own margin, at no
            extra cost to you. Where a programme has not yet approved us, the link still takes you
            to the same verified retailer product page and simply earns us nothing.
          </p>
          <h2 className="pt-2 text-lg font-semibold">How results are ranked</h2>
          <p>
            Ranking is determined by elemental dose per serving, chemical form, published
            third-party certification and cost per serving. No brand or retailer can pay for
            placement, and commission never moves a product up or down. We compare only the
            retailers we have links with, so this site is not a view of the entire market.
          </p>
          <h2 className="pt-2 text-lg font-semibold">Prices and availability</h2>
          <p>
            Prices come from retailer feeds and are refreshed automatically. Every price on this
            site is shown with the date and time it was last checked and is subject to change. If a
            price has not been refreshed in the last 24 hours we mark it as possibly out of date.
            {" "}
            {PRICE_AUTHORITY_NOTE} Products listed as out of stock are never presented as buyable.
          </p>
          <h2 className="pt-2 text-lg font-semibold">Where our links take you</h2>
          <p>
            Every buy button names the retailer it sends you to. We do not hide or disguise
            destinations, and no retailer page is ever opened without you clicking. Your basket on
            this site is an aggregator only: it groups what you picked by shop and hands you over
            to that shop's own checkout. We never take payment and never process your card
            details.
          </p>
          <h2 className="pt-2 text-lg font-semibold">Offers and emails</h2>
          <p>
            We only publish or email discounts that a retailer has actually announced. We never
            invent coupon codes, and our emails link back to this site rather than carrying
            affiliate links.
          </p>
          <h2 className="pt-2 text-lg font-semibold">Independence</h2>
          <p>
            We are not affiliated with, endorsed by or operated by any retailer or brand named on
            this site. All trademarks belong to their owners and are used for identification only.
          </p>
        </div>
        <Link to="/" className="mt-8 inline-block text-sm text-primary hover:underline">
          Back to catalogue
        </Link>
      </main>
    </div>
  );
}
