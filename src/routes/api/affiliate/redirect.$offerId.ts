import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const AWIN_MERCHANT_ID = "12345";
const AWIN_PUBLISHER_ID = "suppcheck";
const AMAZON_TAG = "suppcheck-21";
const LINKWISE_ID = "suppcheck-gr";

function buildAffiliateUrl(network: string, target: string, offerId: string): string {
  try {
    switch (network) {
      case "awin":
        return `https://www.awin1.com/cread.php?awinmid=${AWIN_MERCHANT_ID}&awinaffid=${AWIN_PUBLISHER_ID}&clickref=${encodeURIComponent(
          offerId,
        )}&ued=${encodeURIComponent(target)}`;
      case "amazon": {
        const url = new URL(target);
        url.searchParams.set("tag", AMAZON_TAG);
        url.searchParams.set("ascsubtag", offerId);
        return url.toString();
      }
      case "linkwise":
        return `https://go.linkwi.se/z/${LINKWISE_ID}/ct/?url=${encodeURIComponent(
          target,
        )}&sid=${encodeURIComponent(offerId)}`;
      default: {
        const url = new URL(target);
        url.searchParams.set("ref", "suppcheck");
        return url.toString();
      }
    }
  } catch {
    return target;
  }
}

export const Route = createFileRoute("/api/affiliate/redirect/$offerId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
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
        );

        return new Response(null, {
          status: 302,
          headers: { Location: destination, "Cache-Control": "no-store" },
        });
      },
    },
  },
});
