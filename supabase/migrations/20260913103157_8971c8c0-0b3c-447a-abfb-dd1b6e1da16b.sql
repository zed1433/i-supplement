ALTER TABLE public.products
  ADD COLUMN category_path text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.merchant_offers
  ADD COLUMN retailer_product_id text NOT NULL DEFAULT '',
  ADD COLUMN link_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN link_verified_at timestamp with time zone;

COMMENT ON COLUMN public.products.category_path IS 'Ordered taxonomy segments ending with the full product name.';
COMMENT ON COLUMN public.merchant_offers.retailer_product_id IS 'Retailer-specific product identifier such as an Amazon ASIN or iHerb product ID.';
COMMENT ON COLUMN public.merchant_offers.link_verified IS 'Whether the exact product destination has been manually verified.';