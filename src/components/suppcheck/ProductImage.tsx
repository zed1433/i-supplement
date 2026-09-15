import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";

type Props = {
  src?: string | null;
  alt: string;
  brand?: string;
  /** Tailwind classes for the frame (aspect ratio, rounding, size). */
  className?: string;
  eager?: boolean;
};

/**
 * Product photo with a clean branded fallback tile when the image is missing
 * or fails to load.
 */
export function ProductImage({ src, alt, brand, className = "", eager = false }: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const frame = `flex items-center justify-center overflow-hidden rounded-md border border-border bg-white ${className}`;

  if (!src || failed) {
    return (
      <div
        className={`${frame} flex-col gap-1 bg-surface-raised text-muted-foreground`}
        aria-label={alt}
        role="img"
      >
        <FlaskConical className="size-6 text-primary/60" />
        {brand && (
          <span className="px-2 text-center text-[10px] uppercase tracking-[0.14em]">{brand}</span>
        )}
      </div>
    );
  }

  return (
    <div className={frame}>
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
        className="h-full w-full object-contain p-2"
      />
    </div>
  );
}
