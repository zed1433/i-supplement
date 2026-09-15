import { Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { AFFILIATE_DISCLOSURE } from "@/lib/suppcheck";

export function AffiliateNotice() {
  return (
    <div className="border-b border-border bg-accent/70">
      <p className="mx-auto flex max-w-[1600px] items-start gap-2 px-4 py-2 text-[11px] leading-snug text-accent-foreground sm:px-6 sm:text-xs">
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
