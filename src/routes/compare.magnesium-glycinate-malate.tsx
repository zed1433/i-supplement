import { createFileRoute } from "@tanstack/react-router";
import { StapleComparison } from "@/components/suppcheck/StapleComparison";
import { productsQuery } from "@/lib/suppcheck";
import { stapleByPath } from "@/lib/staples";

const staple = stapleByPath("/compare/magnesium-glycinate-malate");
const url = `https://i-supplement.lovable.app${staple.path}`;

export const Route = createFileRoute("/compare/magnesium-glycinate-malate")({
  staticData: { sitemap: true },
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({
    meta: [
      { title: staple.title },
      { name: "description", content: staple.description },
      { property: "og:title", content: staple.title },
      { property: "og:description", content: staple.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: url }],
  }),
  component: () => <StapleComparison staple={staple} />,
});
