ALTER TABLE public.merchant_offers
  ADD COLUMN IF NOT EXISTS ships_to text[] NOT NULL DEFAULT ARRAY['GLOBAL'];

UPDATE public.merchant_offers SET ships_to = ARRAY['GR'] WHERE merchant_name ILIKE '%skroutz%';
UPDATE public.merchant_offers SET ships_to = ARRAY['EU'] WHERE merchant_name ILIKE 'amazon.de%';
UPDATE public.merchant_offers SET ships_to = ARRAY['GLOBAL'] WHERE merchant_name ILIKE 'iherb%';