import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REGIONS, regionLabel, useRegion, type RegionCode } from "@/lib/region";

export function RegionPrompt() {
  const { suggestedRegion, showPrompt, confirmRegion, dismissPrompt } = useRegion();
  if (!showPrompt) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-xl rounded-lg border border-border bg-surface p-4 shadow-xl sm:bottom-5">
      <div className="flex gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent text-primary"><MapPin className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-semibold">Shopping from {regionLabel(suggestedRegion)}?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Confirm your region so we only show shops that can deliver to you.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => confirmRegion()}>Yes, use {regionLabel(suggestedRegion)}</Button>
            <select
              aria-label="Choose a different region"
              defaultValue=""
              onChange={(event) => event.target.value && confirmRegion(event.target.value as RegionCode)}
              className="h-11 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="" disabled>Choose another region</option>
              {REGIONS.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
            </select>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={dismissPrompt} aria-label="Close region question" className="shrink-0"><X /></Button>
      </div>
    </div>
  );
}