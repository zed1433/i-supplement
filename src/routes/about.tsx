import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { MEDICAL_DISCLAIMER, OPERATOR_CONTACT, SUPPORT_EMAIL } from "@/lib/suppcheck";

const title = "About i-Supplement | Independent Supplement Comparison";
const description =
  "i-Supplement is an independent price and quality comparison platform for lab-tested supplements. How we rank products, source prices, and make money.";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  component: AboutPage,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://i-supplement.lovable.app/about" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://i-supplement.lovable.app/about" }],
  }),
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold">About i-Supplement</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          i-Supplement is an independent comparison platform for dietary supplements. We put the
          things that actually decide whether a supplement is worth buying — elemental dose,
          chemical form, third-party testing and real cost per serving — side by side, across the
          retailers that ship to you.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">What we do</h2>
            <p className="mt-2">
              We are not a shop. We hold no stock, take no payment and ship nothing. We gather
              product facts and retailer prices, normalise them so they can be compared honestly,
              and hand you over to the retailer of your choice to complete the purchase under their
              own terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">How we rank products</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-foreground">Elemental dose per serving</strong> — the amount
                of the actual nutrient, not the weight of the compound.
              </li>
              <li>
                <strong className="text-foreground">Chemical form</strong> — because glycinate,
                oxide and citrate do not behave the same way.
              </li>
              <li>
                <strong className="text-foreground">Third-party testing</strong> — published
                certification where a manufacturer provides it.
              </li>
              <li>
                <strong className="text-foreground">True value</strong> — cost per serving, or cost
                per 100 g for bulk powders, rather than the sticker price.
              </li>
            </ul>
            <p className="mt-2">
              Commission never influences ranking, and no brand or retailer can pay for placement.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Where prices come from</h2>
            <p className="mt-2">
              Prices and stock are taken from retailer feeds and retailer pages and refreshed
              automatically each day. Every price carries the date and time it was last checked, and
              anything older than 24 hours is marked as possibly out of date. The price at the
              retailer&apos;s checkout is always the one that applies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">How we make money</h2>
            <p className="mt-2">
              We may earn an affiliate commission when you buy through a link on this site, at no
              extra cost to you. As an Amazon Associate, we earn from qualifying purchases. Read the
              full{" "}
              <Link className="text-primary underline underline-offset-2" to="/affiliate-disclosure">
                affiliate disclosure
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Contact and support</h2>
            <p className="mt-2">
               {OPERATOR_CONTACT}. Questions, corrections to product data, partnership enquiries and privacy requests all
              go to{" "}
              <a
                className="text-primary underline underline-offset-2"
                href={`mailto:${SUPPORT_EMAIL}`}
              >
                {SUPPORT_EMAIL}
              </a>
              . We reply within a few working days, and within 30 days for data requests.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs leading-relaxed">{MEDICAL_DISCLAIMER}</p>
          </section>
        </div>
      </main>
    </div>
  );
}
