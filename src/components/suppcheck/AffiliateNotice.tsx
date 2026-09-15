import { Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { AFFILIATE_DISCLOSURE } from "@/lib/suppcheck";

export function AffiliateNotice() {
  return (
    <div className="border-b border-border bg-secondary/40">
      <p className="mx-auto flex max-w-7xl items-start gap-2 px-4 py-2 text-[11px] leading-snug text-muted-foreground sm:px-6 sm:text-xs">
        <Info className="mt-px size-3.5 shrink-0" aria-hidden="true" />
        <span>
          {AFFILIATE_DISCLOSURE}{" "}
          <Link to="/affiliate-disclosure" className="underline underline-offset-2 hover:text-foreground">
            Read the full disclosure
          </Link>
          .
        </span>
      </p>
    </div>
  );
}
