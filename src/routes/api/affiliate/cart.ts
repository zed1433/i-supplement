import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { amazonTagFor } from "@/lib/affiliateConfig";

const AMAZON_MARKETS: Record<string, { domain: string }> = {
  US: { domain: "www.amazon.com" },
  DE: { domain: "www.amazon.de" },
  GB: { domain: "www.amazon.co.uk" },
  BR: { domain: "www.amazon.com.br" },
  ZA: { domain: "www.amazon.com" },
  NG: { domain: "www.amazon.com" },
};

function validUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export const Route = createFileRoute("/api/affiliate/cart")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const offerIds = (url.searchParams.get("offers") ?? "").split(",").filter(validUuid).slice(0, 20);
        const quantities = (url.searchParams.get("quantities") ?? "").split(",").map((value) => Math.min(20, Math.max(1, Number.parseInt(value, 10) || 1)));
        const country = (url.searchParams.get("country") ?? "US").toUpperCase();
        const market = AMAZON_MARKETS[country] ?? AMAZON_MARKETS["US"];
        if (!market || !offerIds.length) return new Response("Invalid basket", { status: 400 });

        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const client = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { fetch: (input, init) => {
            const headers = new Headers(init?.headers);
            if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
            headers.set("apikey", key);
            return fetch(input, { ...init, headers });
          } },
        });
        const { data, error } = await client.from("merchant_offers").select("id, merchant_name, affiliate_network, retailer_product_id, in_stock, link_verified").in("id", offerIds);
        if (error || !data || data.length !== offerIds.length) return new Response("Basket offers unavailable", { status: 404 });
        const byId = new Map(data.map((offer) => [offer.id, offer]));
        const ordered = offerIds.map((id) => byId.get(id));
        if (ordered.some((offer) => !offer || !offer.in_stock || !offer.link_verified || !offer.retailer_product_id || !`${offer.merchant_name} ${offer.affiliate_network}`.toLowerCase().includes("amazon"))) return new Response("Basket offers unavailable", { status: 400 });

        const params = new URLSearchParams();
        if (url.searchParams.get("nt") !== "1") params.set("AssociateTag", market.tag);
        ordered.forEach((offer, index) => {
          if (!offer) return;
          params.set(`ASIN.${index + 1}`, offer.retailer_product_id);
          params.set(`Quantity.${index + 1}`, String(quantities[index] ?? 1));
        });
        return Response.redirect(`https://${market.domain}/gp/aws/cart/add.html?${params.toString()}`, 302);
      },
    },
  },
});