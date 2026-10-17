import { createFileRoute } from "@tanstack/react-router";
import { normalizeOff, normalizeUsda, type CalcFood } from "@/lib/calculator/food-sources";

// Public, read-only food search for the calculator. Returns only public reference
// data; the USDA key stays on the server.
export const Route = createFileRoute("/api/public/calc-foods")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async ({ request }) => {
        const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 80);
        if (q.length < 2) return Response.json({ foods: [] });
        const key = process.env["USDA_FDC_API_KEY"] || "DEMO_KEY";
        const usda = fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(q)}&pageSize=15&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS),Branded`,
        )
          .then((r) => (r.ok ? r.json() : { foods: [] }))
          .then((d: { foods?: Parameters<typeof normalizeUsda>[0][] }) => (d.foods ?? []).map(normalizeUsda))
          .catch(() => []);
        const off = fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?action=process&json=1&page_size=15&search_terms=${encodeURIComponent(q)}&fields=code,product_name,brands,countries_tags,nutriments`,
          { headers: { "User-Agent": "i-Supplement calculator/1.0 (contact@i-supplement.com)" } },
        )
          .then((r) => (r.ok ? r.json() : { products: [] }))
          .then((d: { products?: Parameters<typeof normalizeOff>[0][] }) => (d.products ?? []).map(normalizeOff))
          .catch(() => []);
        const foods = (await Promise.all([usda, off])).flat().filter((f): f is CalcFood => f !== null);
        return Response.json({ foods }, { headers: { "cache-control": "public, max-age=3600" } });
      },
    },
  },
});
