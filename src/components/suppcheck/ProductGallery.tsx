import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Expand, ImageIcon, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductImage } from "@/components/suppcheck/ProductImage";
import { galleryImages, type ProductImageRecord } from "@/lib/productImages";
import type { Product } from "@/lib/suppcheck";
import { cn } from "@/lib/utils";

type GalleryProps = {
  product: Product;
  compact?: boolean;
  className?: string;
};

export function ProductGallery({ product, compact = false, className }: GalleryProps) {
  const images = useMemo(() => galleryImages(product), [product]);
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [magnified, setMagnified] = useState(false);
  const touchStartX = useRef(0);
  const current = images[active] ?? images[0];

  useEffect(() => setActive(0), [product.id]);

  if (!current) {
    return (
      <ProductImage
        src=""
        alt={`${product.brands.name} ${product.name}`}
        brand={product.brands.name}
        className={cn("aspect-square w-full", className)}
      />
    );
  }

  const move = (step: number) => setActive((value) => (value + step + images.length) % images.length);
  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? 0;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX ?? start;
    if (Math.abs(end - start) > 45) {
      event.preventDefault();
      move(end < start ? 1 : -1);
    }
  };

  return (
    <div className={className}>
      <div className="relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {compact ? (
          <Link to="/products/$slug" params={{ slug: product.slug }} aria-label={`View ${product.name}`} className="block">
            <ProductImage src={current.image_url} alt={current.alt_text || `${product.brands.name} ${product.name}`} brand={product.brands.name} className="aspect-square w-full" />
          </Link>
        ) : (
          <ProductImage src={current.image_url} alt={current.alt_text || `${product.brands.name} ${product.name}`} brand={product.brands.name} className="aspect-square w-full" eager />
        )}
        {current.image_type === "label" ? (
          <span className="absolute bottom-2 left-2 rounded-md border border-border bg-background/95 px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm">
            Supplement Facts
          </span>
        ) : null}
        {images.length > 1 ? (
          <>
            <Button type="button" variant="outline" size="icon" onClick={() => move(-1)} aria-label="Previous product photo" className="absolute left-2 top-1/2 size-9 -translate-y-1/2 bg-background/95">
              <ChevronLeft />
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={() => move(1)} aria-label="Next product photo" className="absolute right-2 top-1/2 size-9 -translate-y-1/2 bg-background/95">
              <ChevronRight />
            </Button>
            <span className="num absolute bottom-2 right-2 rounded-md bg-foreground/85 px-2 py-1 text-[10px] text-background">
              {active + 1}/{images.length}
            </span>
          </>
        ) : null}
        {!compact ? (
          <Button type="button" variant="outline" size="icon" onClick={() => setZoomed(true)} aria-label="Open full-size product photo" className="absolute right-2 top-2 size-9 bg-background/95">
            <Expand />
          </Button>
        ) : null}
      </div>

      {!compact && images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <Button
              key={image.id}
              type="button"
              variant="outline"
              onClick={() => setActive(index)}
              aria-label={`View ${image.image_type === "label" ? "Supplement Facts" : `photo ${index + 1}`}`}
              aria-current={index === active}
              className={cn("relative h-auto overflow-hidden rounded-md border bg-surface p-1", index === active ? "border-primary ring-2 ring-primary/15" : "border-border")}
            >
              <img src={image.image_url} alt="" loading="lazy" className="aspect-square w-full object-contain" />
              {image.image_type === "label" ? <ImageIcon className="absolute bottom-1 right-1 size-4 rounded-sm bg-background p-0.5 text-primary" /> : null}
            </Button>
          ))}
        </div>
      ) : null}

      <Dialog open={zoomed} onOpenChange={(open) => { setZoomed(open); if (!open) setMagnified(false); }}>
        <DialogContent className="max-h-[96vh] max-w-[96vw] overflow-auto p-3 sm:max-w-5xl">
          <DialogTitle className="pr-10 text-base">{current.image_type === "label" ? "Supplement Facts / ingredients" : `${product.brands.name} ${product.name}`}</DialogTitle>
          <DialogDescription className="sr-only">Enlarge and pan the product photo to inspect the package label.</DialogDescription>
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setMagnified((value) => !value)}>
            {magnified ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
            {magnified ? "Fit photo" : "Zoom in"}
          </Button>
          <div className="max-h-[78vh] overflow-auto">
            <img src={current.image_url} alt={current.alt_text || `${product.name} full-size product view`} className={cn("mx-auto object-contain", magnified ? "h-auto max-w-none w-[min(180vw,1200px)]" : "max-h-[72vh] max-w-full")} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ProductCardGallery({ product }: { product: Product }) {
  return <ProductGallery product={product} compact />;
}

export type { ProductImageRecord };