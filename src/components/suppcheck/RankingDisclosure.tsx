import { ListOrdered } from "lucide-react";

/**
 * EU Omnibus / Consumer Rights Directive Art. 6a: a comparison service must
 * state the main parameters that determine ranking and whether payment
 * influences it. Kept permanently visible on listing surfaces.
 */
export function RankingDisclosure({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs ${className}`}
    >
      <p className="flex items-start gap-2">
        <ListOrdered className="mt-px size-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span>
          <strong className="font-semibold text-foreground">How results are ranked:</strong> by
          elemental dose per serving, chemical form, published third-party certification and cost
          per serving. Commission never affects position and no brand or retailer can pay for
          placement. We list only retailers we have a link with, so this is not a view of the whole
          market.
        </span>
      </p>
    </div>
  );
}
