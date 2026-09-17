import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { affiliateId, amazonTagFor, loadAffiliateOverrides } from "@/lib/affiliateConfig";

/** Geo handoff table: only these markets are accepted from the query string. */
const MARKET_TARGETS: Record<string, { amazonDomain: string; currency: string }> = {
  US: { amazonDomain: "www.amazon.com", currency: "USD" },
  GB: { amazonDomain: "www.amazon.co.uk", currency: "GBP" },
  DE: { amazonDomain: "www.amazon.de", currency: "EUR" },
  BR: { amazonDomain: "www.amazon.com.br", currency: "BRL" },
  ZA: { amazonDomain: "www.amazon.com", currency: "ZAR" },
  NG: { amazonDomain: "www.amazon.com", currency: "NGN" },
};

type Geo = { country?: string | undefined; currency?: string | undefined };

function buildAffiliateUrl(
  network: string,
  target: string,
  offerId: string,
  trackClick = true,
  geo: Geo = {},
): string {
  const market = geo.country ? MARKET_TARGETS[geo.country] : undefined;
  try {
    const targetUrl = new URL(target);
    const targetHost = targetUrl.hostname.toLowerCase();

    // A pasted iHerb product/referral URL is already the authoritative
    // destination. Do not replace it with a generic Awin merchant wrapper.
    if (targetHost === "iherb.com" || targetHost.endsWith(".iherb.com")) {
      if (!targetUrl.searchParams.has("rcode")) {
        targetUrl.searchParams.set("rcode", affiliateId("IHERB_RCODE"));
      }
      return targetUrl.toString();
    }

    switch (network) {
      case "awin":
        return `https://www.awin1.com/cread.php?awinmid=${affiliateId("AWIN_MERCHANT_ID")}&awinaffid=${affiliateId("AWIN_PUBLISHER_ID")}${
          trackClick ? `&clickref=${encodeURIComponent(offerId)}` : ""
        }&ued=${encodeURIComponent(target)}`;
      case "amazon": {
        const url = targetUrl;
        // Route to the shopper's regional Amazon storefront (OneLink-style handoff).
        if (market) url.hostname = market.amazonDomain;
        url.searchParams.set("tag", amazonTagFor(geo.country ?? "US"));
        if (trackClick) url.searchParams.set("ascsubtag", offerId);
        return url.toString();
      }
      case "linkwise":
        return `https://go.linkwi.se/z/${affiliateId("LINKWISE_ID")}/ct/?url=${encodeURIComponent(target)}${
          trackClick ? `&sid=${encodeURIComponent(offerId)}` : ""
        }`;
      default: {
        const url = targetUrl;
        const host = url.hostname;
        if (host.includes("myprotein")) {
          url.searchParams.set("affil", affiliateId("MYPROTEIN_REF"));
        } else if (host.includes("bulksupplements")) {
          url.searchParams.set("ref", affiliateId("BULKSUPPLEMENTS_REF"));
        } else {
          url.searchParams.set("ref", "i-supplement");
        }
        return url.toString();
      }
    }
  } catch {
    return target;
  }
}

export const Route = createFileRoute("/api/affiliate/redirect/$offerId")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        await loadAffiliateOverrides();
        const query = new URL(request.url).searchParams;
        const trackClick = query.get("nt") !== "1";

        const countryParam = (query.get("country") ?? "").toUpperCase();
        const currencyParam = (query.get("currency") ?? "").toUpperCase();
        const geo = {
          country: /^[A-Z]{2}$/.test(countryParam) ? countryParam : undefined,
          currency: /^[A-Z]{3}$/.test(currencyParam) ? currencyParam : undefined,
        };
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const supabase = createClient(process.env["SUPABASE_URL"]!, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
                h.delete("Authorization");
              }
              h.set("apikey", key);
              return fetch(input, { ...init, headers: h });
            },
          },
        });

        const { data, error } = await supabase
          .from("merchant_offers")
          .select("affiliate_target_url, affiliate_network, link_verified")
          .eq("id", params.offerId)
          .maybeSingle();

        if (error || !data?.affiliate_target_url || !data.link_verified) {
          return new Response("Offer not found", { status: 404 });
        }

        const destination = buildAffiliateUrl(
          data.affiliate_network ?? "direct",
          data.affiliate_target_url,
          params.offerId,
          trackClick,
          geo,
        );

        return new Response(null, {
          status: 302,
          headers: { Location: destination, "Cache-Control": "no-store" },
        });
      },
    },
  },
});
