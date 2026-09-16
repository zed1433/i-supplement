import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";

const title = "Privacy Policy | i-Supplement";
const description =
  "What i-Supplement collects, how your email, region preference and basket are stored, and how to unsubscribe or request deletion.";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://i-supplement.lovable.app/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://i-supplement.lovable.app/privacy" }],
  }),
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated {new Date().getFullYear()}. This policy explains what i-Supplement collects
          and why.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">What we collect</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-foreground">Your email address</strong>, only if you create
                an account or subscribe to offer updates.
              </li>
              <li>
                <strong className="text-foreground">Your delivery region</strong>, so we can show
                prices and retailers that actually ship to you.
              </li>
              <li>
                <strong className="text-foreground">Your basket</strong>, which is stored in your
                own browser and never sent to us as an order.
              </li>
              <li>
                Basic, aggregated usage information about which pages are visited, used only to keep
                the site working.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">We never take payment</h2>
            <p className="mt-2">
              i-Supplement does not process purchases and does not handle card details. When you
              choose a retailer you leave for that retailer&apos;s own website, where their privacy
              policy and checkout apply.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Cookies and local storage</h2>
            <p className="mt-2">
              We use first-party cookies and browser local storage to remember your region, your
              basket and your sign-in session. We do not sell your data, and we do not run
              third-party advertising trackers. Clearing your browser storage removes all of it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Affiliate links</h2>
            <p className="mt-2">
              Outbound links to retailers may carry an affiliate reference, which tells the retailer
              the visit came from us. Retailers may set their own cookies once you arrive on their
              site.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Emails and unsubscribing</h2>
            <p className="mt-2">
              Offer emails are only sent to people who subscribed. Every email carries a one-click
              unsubscribe link, and unsubscribing takes effect immediately.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Access and deletion</h2>
            <p className="mt-2">
              You can ask us for a copy of the data linked to your email address, or ask us to
              delete it entirely, by writing to{" "}
              <a
                className="text-primary underline underline-offset-2"
                href="mailto:isupplementsofficial@gmail.com"
              >
                isupplementsofficial@gmail.com
              </a>
              . We respond within 30 days.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
