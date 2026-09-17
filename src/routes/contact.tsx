import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { OPERATOR_IDENTITY, OPERATOR_LOCATION, OPERATOR_NAME, SUPPORT_EMAIL } from "@/lib/suppcheck";

const title = "Contact i-Supplement | Support";
const description = "Contact i-Supplement for support, product corrections, partnerships, privacy requests, and legal questions.";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  component: ContactPage,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://i-supplement.lovable.app/contact" }],
  }),
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold">Contact i-Supplement</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Contact us for support, product-data corrections, partnership enquiries, privacy requests, or questions about our terms.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <section className="rounded-lg border border-border bg-surface p-5"><Mail className="size-5 text-primary" /><h2 className="mt-3 text-base font-semibold">Support</h2><a className="mt-2 block break-all text-sm text-primary underline underline-offset-2" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></section>
          <section className="rounded-lg border border-border bg-surface p-5"><MapPin className="size-5 text-primary" /><h2 className="mt-3 text-base font-semibold">Operator</h2><p className="mt-2 text-sm text-muted-foreground">Operated by {OPERATOR_NAME}<br />{OPERATOR_LOCATION}</p></section>
        </div>
        <section className="mt-6 rounded-lg border border-border bg-surface p-5">
          <h2 className="text-base font-semibold">Service provider details</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{OPERATOR_IDENTITY}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Consumers in the EU may raise a complaint with us by email first; if it is not resolved,
            you can contact the Greek Consumer Ombudsman (Συνήγορος του Καταναλωτή) or the consumer
            authority in your own country. Nothing here affects your statutory rights against the
            retailer you buy from.
          </p>
        </section>
      </main>
    </div>
  );
}