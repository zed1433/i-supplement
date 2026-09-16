import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";

const title = "Terms of Service | i-Supplement";
const description =
  "i-Supplement is an independent supplement comparison and referral service. Prices come from retailers, purchases and returns are handled by them.";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  component: TermsPage,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://i-supplement.lovable.app/terms" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://i-supplement.lovable.app/terms" }],
  }),
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          By using i-Supplement you agree to the terms below.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">What this site is</h2>
            <p className="mt-2">
              i-Supplement is an independent comparison and referral service for dietary
              supplements. We are not a shop. We do not hold stock, take payment, or ship anything.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Prices and availability</h2>
            <p className="mt-2">
              Prices, stock and shipping details come from retailer feeds and retailer pages and can
              change at any time. Every price on this site carries the date it was last checked. The
              price shown at the retailer&apos;s checkout is the price that applies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Buying, delivery and returns</h2>
            <p className="mt-2">
              Your purchase contract is with the retailer you choose, not with us. Delivery,
              customer service, refunds and returns are handled entirely under that
              retailer&apos;s terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Affiliate relationships</h2>
            <p className="mt-2">
              We may earn a commission when you buy through links on this site. This never changes
              the price you pay and never changes how we rank or describe a product.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Not medical advice</h2>
            <p className="mt-2">
              Ingredient, dosage and co-factor information is published for general education only.
              It is not medical advice and is not a diagnosis or treatment. Speak to a qualified
              healthcare professional before starting any supplement, especially if you are
              pregnant, nursing, taking medication or managing a health condition.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Accuracy and liability</h2>
            <p className="mt-2">
              We work from published manufacturer and retailer data and correct errors when we find
              them, but we cannot guarantee that every figure is complete or current. To the extent
              permitted by law, we are not liable for losses arising from reliance on the
              information here or from any transaction with a retailer.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Acceptable use</h2>
            <p className="mt-2">
              Use the site for your own personal, non-commercial research. Do not scrape, copy or
              republish our comparison data in bulk, attempt to break or overload the service, misuse
              accounts or sign-up forms, or use the site for anything unlawful.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              Intellectual property and trademarks
            </h2>
            <p className="mt-2">
              The design, text and compiled comparison data on this site belong to i-Supplement.
              Brand names, retailer names, product names and logos belong to their respective owners
              and are used for identification only; their use does not imply any affiliation with or
              endorsement by them.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Changes to these terms</h2>
            <p className="mt-2">
              We may update these terms as the service develops. The current version is always the
              one published here, and continuing to use the site after a change means you accept it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Governing law</h2>
            <p className="mt-2">
              These terms are governed by the laws of Greece, and disputes fall to the courts there,
              without affecting any mandatory consumer rights you have where you live.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Contact</h2>
            <p className="mt-2">
              Questions about these terms:{" "}
              <a
                className="text-primary underline underline-offset-2"
                href="mailto:isupplementsofficial@gmail.com"
              >
                isupplementsofficial@gmail.com
              </a>
              .
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
