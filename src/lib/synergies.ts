import type { MerchantOffer, Product } from "@/lib/suppcheck";
import { offerShipsTo, type RegionCode } from "@/lib/region";

export type SynergyBadge = "Required Co-factor" | "Absorption Booster" | "Transporter Balance";

type PartnerDefinition = {
  name: string;
  badge: SynergyBadge;
  aliases: string[];
  explanation: string;
};

type SynergyRule = {
  triggers: string[];
  partners: PartnerDefinition[];
  caution?: string;
};

export type ResolvedSynergy = PartnerDefinition & {
  product?: Product | undefined;
  offer?: MerchantOffer | undefined;
};

export type SynergyResult = {
  pairings: ResolvedSynergy[];
  caution?: string | undefined;
};

const required = (name: string, aliases: string[], explanation: string): PartnerDefinition => ({
  name,
  aliases,
  explanation,
  badge: "Required Co-factor",
});

const booster = (name: string, aliases: string[], explanation: string): PartnerDefinition => ({
  name,
  aliases,
  explanation,
  badge: "Absorption Booster",
});

const balance = (name: string, aliases: string[], explanation: string): PartnerDefinition => ({
  name,
  aliases,
  explanation,
  badge: "Transporter Balance",
});

export const SYNERGY_RULES: SynergyRule[] = [
  {
    triggers: ["vitamin b1", "thiamine", "benfotiamine", "ttfd"],
    partners: [
      required("Magnesium", ["magnesium"], "Magnesium is required by thiamine pyrophosphokinase to convert thiamine into active TPP."),
      required("Full B-Complex", ["b-complex", "b complex", "multivitamin", "basic nutrients"], "Vitamins B2 and B3 support adjacent energy pathways and help prevent metabolic bottlenecks."),
    ],
    caution: "Take away from tea, coffee, and concentrated polyphenol extracts, whose tannins can reduce thiamine stability.",
  },
  {
    triggers: ["vitamin b2", "riboflavin", "r-5-p", "r5p"],
    partners: [
      required("Selenium + Iodine", ["selenium", "iodine"], "Riboflavin-derived FAD supports glutathione reductase, while selenium and iodine support thyroid enzyme pathways."),
      required("Molybdenum", ["molybdenum"], "FAD-dependent sulfite oxidase works alongside molybdenum-dependent sulfur metabolism."),
    ],
  },
  {
    triggers: ["vitamin b3", "niacin", "nicotinamide", "nmn", "nicotinamide riboside", " nr "],
    partners: [
      required("Vitamin B2 + B6", ["vitamin b2", "riboflavin", "vitamin b6", "p5p"], "B2 and B6 support the enzyme network that processes niacin and maintains one-carbon metabolism."),
      balance("TMG / Betaine", ["tmg", "betaine"], "TMG supplies methyl groups that can buffer increased nicotinamide clearance and support homocysteine recycling."),
    ],
  },
  {
    triggers: ["vitamin b6", "pyridoxine", "p5p", "p-5-p"],
    partners: [
      required("Magnesium", ["magnesium"], "Magnesium works with active B6 in cellular enzyme reactions and supports mineral transport."),
      required("Vitamin B2", ["vitamin b2", "riboflavin"], "The riboflavin-dependent PNPO enzyme converts vitamin B6 into active P5P."),
    ],
    caution: "Avoid prolonged megadoses of synthetic pyridoxine HCl unless a healthcare professional advises them.",
  },
  {
    triggers: ["vitamin b9", "folate", "5-mthf", "methylfolate"],
    partners: [
      required("Vitamin B12", ["vitamin b12", "methylcobalamin", "cobalamin"], "B12 is needed to recycle methyl-folate and helps prevent the methyl-folate trap."),
      required("B-Complex + Choline", ["b-complex", "b complex", "multivitamin", "choline"], "B2, B6, and choline support linked methylation and homocysteine pathways."),
    ],
  },
  {
    triggers: ["vitamin b12", "methylcobalamin", "adenosylcobalamin", "hydroxocobalamin", "cobalamin"],
    partners: [
      required("Active Folate (5-MTHF)", ["folate", "5-mthf", "methylfolate"], "Active folate and B12 work together in methionine recycling and healthy red-blood-cell formation."),
      required("Potassium", ["potassium"], "Potassium supports normal cellular function while B12-dependent blood-cell production increases."),
    ],
    caution: "Take away from high-dose vitamin C to avoid a possible reduction in B12 stability in the stomach.",
  },
  {
    triggers: ["vitamin b5", "pantothenic", "vitamin b7", "biotin"],
    partners: [
      balance("Biotin + Pantothenic Acid", ["biotin", "pantothenic", "vitamin b5", "vitamin b7"], "Biotin and pantothenic acid share the SMVT intestinal transporter, so high-dose use can create competition."),
      required("Magnesium", ["magnesium"], "Magnesium supports ATP-dependent activation steps used by both nutrients."),
    ],
  },
  {
    triggers: ["vitamin d3", "vitamin d", "cholecalciferol"],
    partners: [
      required("Magnesium", ["magnesium"], "Magnesium is required by the hydroxylase enzymes that convert vitamin D into its active forms."),
      required("Vitamin K2 (MK-7)", ["vitamin k2", "vitamin k", "mk-7", "mk7"], "K2 activates osteocalcin and MGP, helping direct calcium toward bones rather than soft tissues."),
    ],
  },
  {
    triggers: ["vitamin a", "retinol", "beta-carotene", "beta carotene"],
    partners: [
      required("Zinc", ["zinc"], "Zinc supports retinol-binding protein synthesis and vitamin A transport."),
      booster("Dietary Fat + Vitamin E", ["vitamin e", "tocopherol"], "Dietary fat improves absorption of fat-soluble vitamin A, while vitamin E helps protect it from oxidation."),
    ],
  },
  {
    triggers: ["vitamin e", "tocopherol", "tocotrienol"],
    partners: [
      required("Vitamin C", ["vitamin c", "ascorbic"], "Vitamin C can regenerate oxidized vitamin E and restore its antioxidant activity."),
      required("Selenium + Alpha Lipoic Acid", ["selenium", "alpha lipoic", "ala"], "Selenium-dependent enzymes and alpha lipoic acid support the wider antioxidant recycling network."),
    ],
  },
  {
    triggers: ["iron", "ferrous", "ferric", "ferrochel"],
    partners: [
      booster("Vitamin C", ["vitamin c", "ascorbic"], "Vitamin C reduces ferric iron to the more soluble ferrous form, improving non-heme iron uptake."),
      required("Copper", ["copper"], "Copper-dependent ceruloplasmin supports iron mobilization and transport after absorption."),
    ],
    caution: "Separate iron by at least 2 hours from calcium, zinc, magnesium, dairy, coffee, and tea.",
  },
  {
    triggers: ["zinc"],
    partners: [
      balance("Copper", ["copper"], "Long-term zinc intake can reduce copper absorption; balanced intake helps maintain trace-mineral status."),
      booster("Quercetin", ["quercetin"], "Quercetin can act as a zinc ionophore, supporting zinc transport into cells."),
    ],
  },
  {
    triggers: ["magnesium"],
    partners: [
      booster("Vitamin B6", ["vitamin b6", "p5p", "pyridoxine"], "Vitamin B6 supports cellular magnesium transport and retention."),
      required("Vitamin D3", ["vitamin d3", "vitamin d", "cholecalciferol"], "Magnesium activates vitamin D, while vitamin D supports intestinal magnesium handling."),
    ],
    caution: "Separate magnesium from high-dose calcium above 1,000 mg and from iron to limit absorption competition.",
  },
  {
    triggers: ["potassium"],
    partners: [
      required("Magnesium", ["magnesium"], "The sodium-potassium ATPase pump depends on magnesium-bound ATP to maintain cellular electrolyte gradients."),
      balance("Sodium Balance", ["electrolyte", "sodium"], "Potassium and sodium work as a coordinated electrolyte pair rather than isolated nutrients."),
    ],
  },
  {
    triggers: ["calcium"],
    partners: [
      required("Vitamin D3 + K2", ["vitamin d3", "vitamin d", "vitamin k2", "vitamin k", "mk-7"], "D3 supports calcium absorption, while K2 activates proteins that help place calcium in bone."),
      required("Magnesium", ["magnesium"], "Magnesium supports calcium regulation, bone mineral balance, and vitamin D activation."),
    ],
  },
  {
    triggers: ["selenium", "iodine"],
    partners: [
      required("Selenium + Iodine", ["selenium", "iodine"], "Iodine supplies thyroid hormone structure; selenium-dependent deiodinases activate those hormones and antioxidant enzymes protect thyroid tissue."),
    ],
  },
  {
    triggers: ["curcumin", "turmeric", "meriva"],
    partners: [
      booster("Piperine / Black Pepper", ["piperine", "black pepper", "bioperine"], "Piperine inhibits glucuronidation and has been reported to raise curcumin bioavailability by up to 2,000%."),
      booster("Healthy Lipids / Phytosome", ["omega-3", "omega 3", "fish oil", "phytosome"], "Curcumin is lipophilic, so fats or a phospholipid phytosome can improve dispersion and uptake."),
    ],
  },
  {
    triggers: ["coq10", "coenzyme q10", "ubiquinol", "ubiquinone"],
    partners: [
      booster("Healthy Lipids / Omega-3", ["omega-3", "omega 3", "fish oil", "algal oil"], "CoQ10 is fat-soluble and is absorbed more effectively alongside dietary lipids."),
      required("Vitamin B2", ["vitamin b2", "riboflavin"], "Riboflavin supports flavoprotein reactions linked to mitochondrial energy metabolism."),
    ],
  },
  {
    triggers: ["collagen", "hydrolysed collagen", "collagen peptides"],
    partners: [
      required("Vitamin C", ["vitamin c", "ascorbic"], "Vitamin C is an obligate cofactor for the hydroxylase enzymes that stabilize and cross-link collagen."),
      required("Copper", ["copper"], "Copper-dependent lysyl oxidase supports mature collagen cross-linking."),
    ],
  },
  {
    triggers: ["omega-3", "omega 3", "fish oil", "algal oil", "dha", "epa"],
    partners: [
      required("Vitamin E", ["vitamin e", "tocopherol"], "Vitamin E helps protect highly unsaturated omega-3 fatty acids from oxidation."),
    ],
  },
];

function searchable(product: Product): string {
  return [
    product.name,
    product.category,
    product.form,
    ...product.category_path,
    ...product.product_ingredients.flatMap((item) => [item.ingredients.name, item.ingredients.chemical_form]),
  ]
    .join(" ")
    .toLowerCase();
}

function aliasScore(text: string, aliases: string[]): number {
  return aliases.reduce((score, alias) => score + (text.includes(alias.toLowerCase()) ? alias.length : 0), 0);
}

function bestEligibleOffer(product: Product, region: RegionCode): MerchantOffer | undefined {
  return product.merchant_offers
    .filter((offer) => offer.in_stock && offer.link_verified && offerShipsTo(offer, region))
    .sort((a, b) => Number(a.price) - Number(b.price))[0];
}

export function resolveSynergies(active: Product, products: Product[], region: RegionCode): SynergyResult {
  const activeText = searchable(active);
  const categoryText = `${active.category} ${active.category_path[2] ?? ""}`.toLowerCase();
  const rule =
    SYNERGY_RULES.find((candidate) => aliasScore(categoryText, candidate.triggers) > 0) ??
    SYNERGY_RULES.find((candidate) => aliasScore(activeText, candidate.triggers) > 0);
  if (!rule) return { pairings: [] };

  const pairings = rule.partners.slice(0, 2).map<ResolvedSynergy>((partner) => {
    const matches = products
      .filter((candidate) => candidate.id !== active.id)
      .map((candidate) => ({ candidate, score: aliasScore(searchable(candidate), partner.aliases) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => {
        const aOffer = bestEligibleOffer(a.candidate, region);
        const bOffer = bestEligibleOffer(b.candidate, region);
        if (Boolean(aOffer) !== Boolean(bOffer)) return aOffer ? -1 : 1;
        if (b.score !== a.score) return b.score - a.score;
        return aOffer && bOffer ? Number(aOffer.price) - Number(bOffer.price) : a.candidate.name.localeCompare(b.candidate.name);
      });
    const product = matches[0]?.candidate;
    return { ...partner, product, offer: product ? bestEligibleOffer(product, region) : undefined };
  });

  return { pairings, caution: rule.caution };
}