CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_type text NOT NULL DEFAULT 'gallery' CHECK (image_type IN ('front', 'label', 'back', 'gallery')),
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  source text NOT NULL DEFAULT '',
  alt_text text NOT NULL DEFAULT '',
  width integer CHECK (width IS NULL OR width > 0),
  height integer CHECK (height IS NULL OR height > 0),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, image_url)
);

GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product images are public"
ON public.product_images FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can insert product images"
ON public.product_images FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product images"
ON public.product_images FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product images"
ON public.product_images FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX product_images_product_order_idx
ON public.product_images (product_id, display_order, id);

CREATE UNIQUE INDEX product_images_one_primary_idx
ON public.product_images (product_id)
WHERE is_primary;

CREATE TRIGGER trg_product_images_updated
BEFORE UPDATE ON public.product_images
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();