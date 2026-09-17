import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { OPERATOR_CONTACT, SUPPORT_EMAIL } from "@/lib/suppcheck";

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
              We use first-party cookies and browser local storage only. On your first visit a
              consent banner lets you accept all, reject everything non-essential, or choose
              category by category; your choice is stored in your browser and can be changed at
              any time with the &ldquo;Cookie settings&rdquo; link in the footer.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-foreground">Strictly necessary</strong> — your basket,
                sign-in session and security. Always active; the site cannot work without it.
              </li>
              <li>
                <strong className="text-foreground">Preferences</strong> — your delivery region, so
                prices, currency and shipping are shown for the right country.
              </li>
              <li>
                <strong className="text-foreground">Affiliate measurement</strong> — a per-click
                reference added to retailer links so a purchase can be credited to us. If you
                decline, the reference is left off the link.
              </li>
              <li>
                <strong className="text-foreground">Regional analytics</strong> — aggregated,
                region-level counts of which comparisons are used. No profiles, no advertising
                networks, never sold or shared.
              </li>
            </ul>
            <p className="mt-2">
              We do not sell your data and we do not run third-party advertising trackers. Clearing
              your browser storage removes all of it, including your consent choice.
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
            <h2 className="text-base font-semibold text-foreground">Why we are allowed to use it</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-foreground">Consent</strong> — offer emails. You give it by
                subscribing and withdraw it by unsubscribing.
              </li>
              <li>
                <strong className="text-foreground">Contract</strong> — running your account and
                sign-in session.
              </li>
              <li>
                <strong className="text-foreground">Legitimate interest</strong> — keeping the site
                secure, working and free of abuse, and remembering your region and basket.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">How long we keep it</h2>
            <p className="mt-2">
              Subscription and account data is kept until you unsubscribe or ask for deletion, after
              which it is removed within 30 days apart from a minimal suppression record that stops
              us emailing you again. Your region and basket live in your own browser until you clear
              them. Aggregated usage counts contain no identifiers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Who we share it with</h2>
            <p className="mt-2">
              Only the providers that run the service for us: our hosting and database provider and
              our email delivery provider. They act on our instructions and cannot use your data for
              their own purposes. We never sell or share personal information for money or for
              cross-context behavioural advertising, so under the CCPA there is nothing to opt out
              of — but you may still tell us not to, and we will record it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Your rights</h2>
            <p className="mt-2">
              Wherever you live, we honour the rights given by the GDPR and the CCPA/CPRA: to know
              what we hold, to get a copy, to correct it, to delete it, to receive it in a portable
              form, to object to or restrict a use, to withdraw consent at any time, and not to be
              treated differently for exercising any of them. If you are in the EU/EEA or UK you may
              also complain to your national data protection authority.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              Making a request, and children
            </h2>
            <p className="mt-2">
               {OPERATOR_CONTACT}. Write to{" "}
              <a
                className="text-primary underline underline-offset-2"
                 href={`mailto:${SUPPORT_EMAIL}`}
              >
                 {SUPPORT_EMAIL}
              </a>{" "}
              from the address you signed up with and we will respond within 30 days, free of
              charge. The site is not intended for anyone under 16 and we do not knowingly collect
              their data. Data may be processed on servers outside your country, under standard
              contractual protections.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
