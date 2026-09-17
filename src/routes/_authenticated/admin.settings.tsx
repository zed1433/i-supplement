import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { getAffiliateIdStatus, saveAffiliateId } from "@/lib/affiliate.functions";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  staticData: { sitemap: false },
  component: AffiliateSettingsPage,
});

function AffiliateSettingsPage() {
  const fetchStatus = useServerFn(getAffiliateIdStatus);
  const save = useServerFn(saveAffiliateId);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "affiliate-ids"],
    queryFn: fetchStatus,
    retry: false,
  });

  async function submit(key: string) {
    setBusy(key);
    try {
      await save({ data: { key, value: drafts[key] ?? "" } });
      setDrafts((prev) => ({ ...prev, [key]: "" }));
      await refetch();
      toast.success("Saved — retailer links now use this identifier.");
    } catch {
      toast.error("Could not save. Check you are signed in as an admin.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin">
            <ArrowLeft className="size-4" /> Back to catalogue admin
          </Link>
        </Button>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Retailer affiliate identifiers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste the real identifier from each programme once it approves you. Until then every
          button keeps working on a demo identifier — it simply earns no commission.
        </p>

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}
        {error && (
          <p className="mt-8 text-sm text-destructive">
            Admin access required to view affiliate identifiers.
          </p>
        )}

        <div className="mt-6 space-y-3">
          {(data ?? []).map((row) => (
            <div
              key={row.key}
              className="rounded-lg border border-border bg-surface p-4 sm:flex sm:items-center sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{row.retailer}</p>
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Current: <span className="font-mono">{row.preview}</span>{" "}
                  <span
                    className={`ml-1 rounded border px-1.5 py-0.5 ${
                      row.demo
                        ? "border-warning/40 bg-warning/10 text-warning-foreground"
                        : "border-primary/40 bg-primary/10 text-primary"
                    }`}
                  >
                    {row.demo ? "Demo tracking" : "Live"}
                  </span>
                </p>
              </div>
              <form
                className="mt-3 flex gap-2 sm:mt-0 sm:w-80"
                onSubmit={(event) => {
                  event.preventDefault();
                  void submit(row.key);
                }}
              >
                <Input
                  value={drafts[row.key] ?? ""}
                  placeholder="Paste real identifier"
                  onChange={(event) =>
                    setDrafts((prev) => ({ ...prev, [row.key]: event.target.value }))
                  }
                />
                <Button type="submit" size="sm" disabled={busy === row.key}>
                  <Save className="size-4" /> Save
                </Button>
              </form>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Saving an empty field clears your value and returns that programme to the demo
          identifier.
        </p>
      </main>
    </div>
  );
}
