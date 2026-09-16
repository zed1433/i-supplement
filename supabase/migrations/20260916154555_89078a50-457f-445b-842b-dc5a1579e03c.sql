ALTER TABLE public.products
  ADD COLUMN pricing_basis text,
  ADD COLUMN total_servings numeric,
  ADD COLUMN net_weight_grams numeric,
  ADD COLUMN serving_weight_grams numeric,
  ADD COLUMN catalog_group text;

ALTER TABLE public.products
  ADD CONSTRAINT products_pricing_basis_valid CHECK (pricing_basis IS NULL OR pricing_basis IN ('per_serving', 'bulk_powder')),
  ADD CONSTRAINT products_total_servings_positive CHECK (total_servings IS NULL OR total_servings > 0),
  ADD CONSTRAINT products_net_weight_grams_positive CHECK (net_weight_grams IS NULL OR net_weight_grams > 0),
  ADD CONSTRAINT products_serving_weight_grams_positive CHECK (serving_weight_grams IS NULL OR serving_weight_grams > 0),
  ADD CONSTRAINT products_catalog_group_valid CHECK (catalog_group IS NULL OR catalog_group IN ('Vitamins & Minerals', 'Performance & Protein', 'Nootropics & Focus', 'Longevity'));

COMMENT ON COLUMN public.products.pricing_basis IS 'Value metric mode: per_serving or bulk_powder.';
COMMENT ON COLUMN public.products.total_servings IS 'Verified servings contained in this product SKU.';
COMMENT ON COLUMN public.products.net_weight_grams IS 'Verified net package weight in grams.';
COMMENT ON COLUMN public.products.serving_weight_grams IS 'Verified serving weight in grams.';
COMMENT ON COLUMN public.products.catalog_group IS 'Top-level customer-facing catalog navigation group.';