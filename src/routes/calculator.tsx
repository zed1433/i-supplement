import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";

export const Route = createFileRoute("/calculator")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Nutrition Calculator — Macros, Micronutrients & Absorption | i-Supplement" },
      {
        name: "description",
        content:
          "Build a meal from 4,000+ lab-measured foods (USDA, CIQUAL) and packaged foods, see calories, macros and micronutrients against official targets, plus modeled iron, B12 and zinc absorption.",
      },
      { property: "og:title", content: "Nutrition Calculator | i-Supplement" },
      {
        property: "og:description",
        content:
          "Calculate calories, macros and micronutrients from real foods, with evidence-bounded absorption estimates and supplement comparison links.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalculatorPage,
});

function CalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <iframe
        src="/bio-calculator/index.html"
        title="Bio Calculator"
        className="block h-[calc(100vh-4rem)] w-full border-0"
      />
      <p className="px-4 py-3 text-xs text-muted-foreground">
        Food data: USDA FoodData Central (public domain) · ANSES-CIQUAL 2020 French food composition
        table (Etalab Open Licence) · Open Food Facts packaged-food label data (ODbL).
      </p>

    </div>
  );
}
