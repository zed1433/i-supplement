
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country_of_origin text NOT NULL DEFAULT '',
  website_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands are public" ON public.brands FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  form text NOT NULL,
  serving_size text NOT NULL DEFAULT '',
  primary_benefit text NOT NULL DEFAULT '',
  verified_advantages text[] NOT NULL DEFAULT '{}',
  trade_offs text[] NOT NULL DEFAULT '{}',
  excipients text[] NOT NULL DEFAULT '{}',
  third_party_certifications text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products are public" ON public.products FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  chemical_form text NOT NULL,
  elemental_ratio numeric NOT NULL DEFAULT 0,
  mechanism_of_action text NOT NULL DEFAULT '',
  target_benefits text[] NOT NULL DEFAULT '{}',
  potential_side_effects text[] NOT NULL DEFAULT '{}',
  contraindications text[] NOT NULL DEFAULT '{}',
  upper_tolerable_limit text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ingredients TO anon, authenticated;
GRANT ALL ON public.ingredients TO service_role;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ingredients are public" ON public.ingredients FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.product_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  gross_amount_mg numeric NOT NULL DEFAULT 0,
  elemental_amount_mg numeric NOT NULL DEFAULT 0,
  percent_daily_value numeric NOT NULL DEFAULT 0,
  bioavailability_score text NOT NULL DEFAULT 'Moderate'
);
GRANT SELECT ON public.product_ingredients TO anon, authenticated;
GRANT ALL ON public.product_ingredients TO service_role;
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_ingredients are public" ON public.product_ingredients FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.merchant_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  merchant_name text NOT NULL,
  country_flag text NOT NULL DEFAULT '',
  affiliate_network text NOT NULL DEFAULT 'direct',
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  shipping_cost numeric NOT NULL DEFAULT 0,
  estimated_delivery text NOT NULL DEFAULT '',
  affiliate_target_url text NOT NULL DEFAULT '',
  in_stock boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.merchant_offers TO anon, authenticated;
GRANT ALL ON public.merchant_offers TO service_role;
ALTER TABLE public.merchant_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant_offers are public" ON public.merchant_offers FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.brands (name, country_of_origin, website_url) VALUES
 ('Thorne', 'USA', 'https://www.thorne.com'),
 ('Seeking Health', 'USA', 'https://www.seekinghealth.com'),
 ('Pure Encapsulations', 'USA', 'https://www.pureencapsulations.com'),
 ('Doctor''s Best', 'USA', 'https://www.doctorsbest.com'),
 ('NOW Foods', 'USA', 'https://www.nowfoods.com'),
 ('Life Extension', 'USA', 'https://www.lifeextension.com');

INSERT INTO public.ingredients (name, chemical_form, elemental_ratio, mechanism_of_action, target_benefits, potential_side_effects, contraindications, upper_tolerable_limit) VALUES
 ('Magnesium Bisglycinate', 'Bisglycinate', 0.141,
  'Two glycine molecules fully chelate the magnesium ion, forming a neutral ring structure absorbed intact through intestinal dipeptide (PepT1) transporters rather than the saturable paracellular route. Because the ion is not liberated in the lumen, osmotic water retention and the resulting laxative effect are largely avoided, and glycine itself acts as an inhibitory neurotransmitter at glycine receptors.',
  ARRAY['Sleep latency and depth','Neuromuscular relaxation','Anxiolytic support via glycine','Cramp reduction'],
  ARRAY['Mild sedation at high evening doses','Rare loose stools above 500 mg elemental'],
  ARRAY['eGFR < 30 mL/min (renal insufficiency)','Concurrent quinolone or tetracycline antibiotics within 2 h','Myasthenia gravis (relative)'],
  '350 mg/day elemental from supplemental sources (EFSA/IOM)'),
 ('Magnesium Malate', 'Malate', 0.155,
  'Magnesium salt of malic acid. Dissociates in the acidic stomach; malate re-enters the Krebs cycle as an intermediate, supporting mitochondrial ATP regeneration. Absorption is moderate and partially paracellular, giving a mild osmotic load at higher servings.',
  ARRAY['Daytime energy and ATP turnover','Fibromyalgia-associated muscle discomfort','General repletion'],
  ARRAY['Mild GI looseness','Occasional gastric acidity'],
  ARRAY['Severe renal impairment','Active peptic ulcer (relative, due to acid load)'],
  '350 mg/day elemental from supplemental sources'),
 ('Magnesium Glycinate', 'Glycinate', 0.14,
  'Amino-acid chelate closely related to bisglycinate; a portion may be buffered with magnesium oxide in cheaper formulas. Fully reacted chelate is absorbed via peptide transport with high tolerance and minimal osmotic draw.',
  ARRAY['Stress-axis modulation','Sleep quality','Gentle daily repletion'],
  ARRAY['Mild drowsiness','Loose stools if oxide-buffered'],
  ARRAY['Severe renal impairment','Concurrent bisphosphonates within 2 h'],
  '350 mg/day elemental from supplemental sources'),
 ('Magnesium Lysinate Glycinate', 'Lysinate Glycinate (TRAACS)', 0.10,
  'Albion TRAACS dual amino-acid chelate using both lysine and glycine as carrier ligands, verified by FT-IR spectroscopy for chelation integrity. The larger ligand set keeps the complex stable across gastric pH so the ion reaches the small intestine intact.',
  ARRAY['High absorption with low GI burden','Muscle recovery','Cardiovascular rhythm support'],
  ARRAY['Rare mild nausea on empty stomach'],
  ARRAY['Chronic kidney disease stages 4-5','Heart block / bradyarrhythmia with concurrent IV magnesium'],
  '350 mg/day elemental from supplemental sources'),
 ('Magnesium Citrate', 'Citrate', 0.162,
  'Magnesium bound to citric acid. Highly water-soluble and reasonably bioavailable, but unabsorbed magnesium remains osmotically active in the colon, drawing water into the lumen — the mechanism behind its use as a saline laxative.',
  ARRAY['Constipation relief','Cost-efficient repletion','Kidney-stone (calcium oxalate) risk reduction'],
  ARRAY['Osmotic diarrhoea','Abdominal cramping','Electrolyte loss at laxative doses'],
  ARRAY['Renal insufficiency','Inflammatory bowel disease flare','Bowel obstruction'],
  '350 mg/day elemental from supplemental sources'),
 ('Magnesium L-Threonate', 'L-Threonate', 0.072,
  'Magnesium bound to L-threonic acid, a vitamin C metabolite. The threonate carrier facilitates transport across the blood-brain barrier, raising cerebrospinal fluid magnesium in rodent models where conventional salts do not — at the cost of a very low elemental payload per gram of compound.',
  ARRAY['Working memory and executive function','Synaptic density support','Age-related cognitive maintenance'],
  ARRAY['Vivid dreams','Headache at initiation','Low elemental yield requires 3 capsules'],
  ARRAY['Severe renal impairment','Pregnancy (insufficient data)'],
  '350 mg/day elemental from supplemental sources');

INSERT INTO public.products (brand_id, name, slug, category, form, serving_size, primary_benefit, verified_advantages, trade_offs, excipients, third_party_certifications) VALUES
 ((SELECT id FROM public.brands WHERE name='Thorne'), 'Magnesium Bisglycinate Powder', 'thorne-magnesium-bisglycinate', 'Magnesium', 'Powder', '1 scoop (5.4 g)', 'Sleep and neuromuscular relaxation',
  ARRAY['NSF Certified for Sport — every lot assayed for 290+ banned substances','Fully reacted bisglycinate, no oxide buffering','200 mg elemental per scoop with no laxative rebound','Monk fruit sweetened, no artificial sweeteners'],
  ARRAY['Powder format requires dosing by scoop','Natural flavour blend is proprietary','Highest cost per 100 mg elemental in the magnesium cohort'],
  ARRAY['Monk fruit extract','Natural flavors','Citric acid'],
  ARRAY['NSF Certified for Sport','Non-GMO']),
 ((SELECT id FROM public.brands WHERE name='Seeking Health'), 'Magnesium Malate', 'seeking-health-magnesium-malate', 'Magnesium', 'Capsules', '2 capsules', 'Daytime mitochondrial energy',
  ARRAY['Malate carrier feeds the Krebs cycle directly','No magnesium stearate used as flow agent','Transparent lot-level certificate of analysis'],
  ARRAY['Moderate osmotic load at 2-capsule serving','No sport certification','Two capsules needed for a full serving'],
  ARRAY['Hypromellose (capsule)','Microcrystalline cellulose','Silicon dioxide'],
  ARRAY['Non-GMO']),
 ((SELECT id FROM public.brands WHERE name='Pure Encapsulations'), 'Magnesium Glycinate', 'pure-encapsulations-magnesium-glycinate', 'Magnesium', 'Capsules', '1 capsule', 'Hypoallergenic daily repletion',
  ARRAY['Certified hypoallergenic — free of the 8 major allergens','USP Verified potency and purity','Single-capsule serving, no flow agents'],
  ARRAY['Only 120 mg elemental per capsule','Premium price per capsule','Vegetarian capsule may be brittle in heat'],
  ARRAY['Hypromellose (capsule)','Ascorbyl palmitate'],
  ARRAY['USP Verified','Non-GMO']),
 ((SELECT id FROM public.brands WHERE name='Doctor''s Best'), 'High Absorption Magnesium (Lysinate Glycinate)', 'doctors-best-magnesium-lysinate-glycinate', 'Magnesium', 'Tablets', '2 tablets', 'High absorption at low cost',
  ARRAY['Albion TRAACS chelate with FT-IR verified chelation integrity','Exceptional cost per 100 mg elemental','Widely stocked across EU and US merchants'],
  ARRAY['Contains magnesium stearate and silicon dioxide','Large tablets, some report difficulty swallowing','No sport certification'],
  ARRAY['Magnesium stearate','Silicon dioxide','Modified cellulose','Croscarmellose sodium'],
  ARRAY['Non-GMO']),
 ((SELECT id FROM public.brands WHERE name='NOW Foods'), 'Magnesium Citrate', 'now-foods-magnesium-citrate', 'Magnesium', 'Capsules', '3 capsules', 'Budget repletion and bowel regularity',
  ARRAY['Informed Choice certified manufacturing facility','Lowest cost per 100 mg elemental in the cohort','Genuine citrate, not oxide relabelled'],
  ARRAY['Pronounced osmotic laxative effect above 300 mg','Three capsules per serving','Contains magnesium stearate'],
  ARRAY['Magnesium stearate','Silica','Hypromellose (capsule)'],
  ARRAY['Informed Choice','Non-GMO']),
 ((SELECT id FROM public.brands WHERE name='Life Extension'), 'Neuro-Mag Magnesium L-Threonate', 'life-extension-neuro-mag-threonate', 'Magnesium', 'Capsules', '3 capsules', 'Cognition and brain magnesium',
  ARRAY['Magtein L-threonate with published CSF penetration data','Third-party heavy metal assay per lot','No artificial sweeteners or colours'],
  ARRAY['Only 144 mg elemental per 3-capsule serving','Very high cost per 100 mg elemental','Contains silicon dioxide and vegetable stearate'],
  ARRAY['Vegetable cellulose (capsule)','Silicon dioxide','Vegetable stearate'],
  ARRAY['Non-GMO']);

INSERT INTO public.product_ingredients (product_id, ingredient_id, gross_amount_mg, elemental_amount_mg, percent_daily_value, bioavailability_score) VALUES
 ((SELECT id FROM public.products WHERE slug='thorne-magnesium-bisglycinate'), (SELECT id FROM public.ingredients WHERE name='Magnesium Bisglycinate'), 1418, 200, 48, 'High'),
 ((SELECT id FROM public.products WHERE slug='seeking-health-magnesium-malate'), (SELECT id FROM public.ingredients WHERE name='Magnesium Malate'), 1290, 200, 48, 'Moderate'),
 ((SELECT id FROM public.products WHERE slug='pure-encapsulations-magnesium-glycinate'), (SELECT id FROM public.ingredients WHERE name='Magnesium Glycinate'), 857, 120, 29, 'High'),
 ((SELECT id FROM public.products WHERE slug='doctors-best-magnesium-lysinate-glycinate'), (SELECT id FROM public.ingredients WHERE name='Magnesium Lysinate Glycinate'), 1000, 100, 24, 'High'),
 ((SELECT id FROM public.products WHERE slug='now-foods-magnesium-citrate'), (SELECT id FROM public.ingredients WHERE name='Magnesium Citrate'), 2222, 400, 95, 'Moderate'),
 ((SELECT id FROM public.products WHERE slug='life-extension-neuro-mag-threonate'), (SELECT id FROM public.ingredients WHERE name='Magnesium L-Threonate'), 2000, 144, 34, 'High');

INSERT INTO public.merchant_offers (product_id, merchant_name, country_flag, affiliate_network, price, currency, shipping_cost, estimated_delivery, affiliate_target_url, in_stock) VALUES
 ((SELECT id FROM public.products WHERE slug='thorne-magnesium-bisglycinate'), 'iHerb', 'US', 'awin', 41.90, 'EUR', 6.50, '5-8 business days', 'https://www.iherb.com/pr/thorne-magnesium-bisglycinate/104812', true),
 ((SELECT id FROM public.products WHERE slug='thorne-magnesium-bisglycinate'), 'Amazon.de', 'DE', 'amazon', 46.95, 'EUR', 0, '1-2 business days', 'https://www.amazon.de/dp/B08K1J7QMT', true),
 ((SELECT id FROM public.products WHERE slug='thorne-magnesium-bisglycinate'), 'Pharmacy24 (Skroutz)', 'GR', 'linkwise', 49.20, 'EUR', 2.90, '2-4 business days', 'https://www.pharmacy24.gr/thorne-magnesium-bisglycinate', false),
 ((SELECT id FROM public.products WHERE slug='seeking-health-magnesium-malate'), 'iHerb', 'US', 'awin', 24.40, 'EUR', 6.50, '5-8 business days', 'https://www.iherb.com/pr/seeking-health-magnesium-malate/98211', true),
 ((SELECT id FROM public.products WHERE slug='seeking-health-magnesium-malate'), 'Amazon.de', 'DE', 'amazon', 29.99, 'EUR', 0, '2-3 business days', 'https://www.amazon.de/dp/B07QK8N3RT', true),
 ((SELECT id FROM public.products WHERE slug='pure-encapsulations-magnesium-glycinate'), 'iHerb', 'US', 'awin', 32.10, 'EUR', 6.50, '5-8 business days', 'https://www.iherb.com/pr/pure-encapsulations-magnesium-glycinate/71542', true),
 ((SELECT id FROM public.products WHERE slug='pure-encapsulations-magnesium-glycinate'), 'Amazon.de', 'DE', 'amazon', 35.50, 'EUR', 0, '1-2 business days', 'https://www.amazon.de/dp/B0018OL4LE', true),
 ((SELECT id FROM public.products WHERE slug='pure-encapsulations-magnesium-glycinate'), 'Farmakeio Online (Skroutz)', 'GR', 'linkwise', 33.80, 'EUR', 3.50, '2-4 business days', 'https://www.skroutz.gr/pure-encapsulations-magnesium-glycinate', true),
 ((SELECT id FROM public.products WHERE slug='doctors-best-magnesium-lysinate-glycinate'), 'iHerb', 'US', 'awin', 16.75, 'EUR', 6.50, '5-8 business days', 'https://www.iherb.com/pr/doctors-best-high-absorption-magnesium/15318', true),
 ((SELECT id FROM public.products WHERE slug='doctors-best-magnesium-lysinate-glycinate'), 'Amazon.de', 'DE', 'amazon', 19.49, 'EUR', 0, '1-2 business days', 'https://www.amazon.de/dp/B000BD0RT0', true),
 ((SELECT id FROM public.products WHERE slug='doctors-best-magnesium-lysinate-glycinate'), 'Pharmacy24 (Skroutz)', 'GR', 'linkwise', 21.90, 'EUR', 2.90, '2-4 business days', 'https://www.pharmacy24.gr/doctors-best-magnesium', true),
 ((SELECT id FROM public.products WHERE slug='now-foods-magnesium-citrate'), 'iHerb', 'US', 'awin', 13.20, 'EUR', 6.50, '5-8 business days', 'https://www.iherb.com/pr/now-foods-magnesium-citrate/1064', true),
 ((SELECT id FROM public.products WHERE slug='now-foods-magnesium-citrate'), 'Amazon.de', 'DE', 'amazon', 17.95, 'EUR', 0, '1-2 business days', 'https://www.amazon.de/dp/B0013OQGO6', true),
 ((SELECT id FROM public.products WHERE slug='now-foods-magnesium-citrate'), 'Farmakeio Online (Skroutz)', 'GR', 'linkwise', 18.40, 'EUR', 3.50, '3-5 business days', 'https://www.skroutz.gr/now-foods-magnesium-citrate', true),
 ((SELECT id FROM public.products WHERE slug='life-extension-neuro-mag-threonate'), 'iHerb', 'US', 'awin', 34.60, 'EUR', 6.50, '5-8 business days', 'https://www.iherb.com/pr/life-extension-neuro-mag/50914', true),
 ((SELECT id FROM public.products WHERE slug='life-extension-neuro-mag-threonate'), 'Amazon.de', 'DE', 'amazon', 39.90, 'EUR', 0, '1-2 business days', 'https://www.amazon.de/dp/B00PLTOF4S', true),
 ((SELECT id FROM public.products WHERE slug='life-extension-neuro-mag-threonate'), 'Pharmacy24 (Skroutz)', 'GR', 'linkwise', 42.50, 'EUR', 2.90, '2-4 business days', 'https://www.pharmacy24.gr/life-extension-neuro-mag', false);
