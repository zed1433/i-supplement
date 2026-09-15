import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import {
  isSitemapRouteIncluded,
  sitemapPathForLocation,
  sitemapStaticPaths,
  sitemapXML,
  type SitemapEntry,
} from "@/lib/sitemap";

const BASE_URL = "https://i-supplement.lovable.app";

const PRODUCT_ROUTE_ID = "/products/$slug";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));

        if (isSitemapRouteIncluded(router.routesById[PRODUCT_ROUTE_ID])) {
          const { createClient } = await import("@supabase/supabase-js");
          const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
          const supabase = createClient(process.env["SUPABASE_URL"]!, key, {
            auth: { persistSession: false, autoRefreshToken: false },
            global: {
              fetch: (input, init) => {
                const headers = new Headers(init?.headers);
                if (key.startsWith("sb_") && headers.get("Authorization") === "Bearer " + key)
                  headers.delete("Authorization");
                headers.set("apikey", key);
                return fetch(input, { ...init, headers });
              },
            },
          });

          const pageSize = 1000;
          for (let offset = 0; ; ) {
            const { data, error } = await supabase
              .from("products")
              .select("slug")
              .order("id")
              .range(offset, offset + pageSize - 1);
            if (error) throw error;
            if (!data || data.length === 0) break;
            for (const row of data) {
              if (!row.slug) continue;
              const location = router.buildLocation({
                to: PRODUCT_ROUTE_ID,
                params: { slug: row.slug },
                search: () => ({}),
                hash: "",
              });
              const path = sitemapPathForLocation(router, location, PRODUCT_ROUTE_ID);
              if (path) entries.push({ path });
            }
            offset += data.length;
          }
        }

        if (entries.length === 0) {
          return new Response("No pages are included in this sitemap.", {
            status: 404,
            headers: { "Cache-Control": "no-store" },
          });
        }

        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
