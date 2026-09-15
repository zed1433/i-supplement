import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Play, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { deleteFeed, listFeeds, runFeedNow, saveFeed, setJobPaused } from "@/lib/automation.functions";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/feeds")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Price & stock feeds | i-Supplement admin" },
      { name: "description", content: "Daily retailer price and stock updates for i-Supplement." },
    ],
  }),
  component: FeedsPage,
});

type FeedForm = {
  id?: string;
  merchant_name: string;
  source_kind: "url" | "email" | "manual";
  feed_url: string;
  from_email: string;
  active: boolean;
  mapping: Record<string, string>;
};

const EMPTY: FeedForm = {
  merchant_name: "",
  source_kind: "url",
  feed_url: "",
  from_email: "",
  active: true,
  mapping: {},
};

const MAPPING_FIELDS = ["product_id", "url", "price", "currency", "stock", "image", "name"] as const;

function FeedsPage() {
  const qc = useQueryClient();
  const fetchFeeds = useServerFn(listFeeds);
  const save = useServerFn(saveFeed);
  const remove = useServerFn(deleteFeed);
  const runNow = useServerFn(runFeedNow);
  const pauseJob = useServerFn(setJobPaused);

  const [form, setForm] = useState<FeedForm | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "feeds"],
    queryFn: fetchFeeds,
    retry: false,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "feeds"] });

  const saveMutation = useMutation({
    mutationFn: (f: FeedForm) => save({ data: f }),
    onSuccess: () => {
      toast.success("Feed saved");
      setForm(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const runMutation = useMutation({
    mutationFn: (vars: { id: string; csv?: string }) => runNow({ data: vars }),
    onSuccess: (r: any) =>
      toast.success(
        `${r.rows_updated} offers updated, ${r.rows_matched} matched of ${r.rows_total} rows${
          r.unmatched.length ? `, ${r.unmatched.length} unmatched` : ""
        }`,
      ),
    onError: (e: Error) => toast.error(e.message),
  });

  async function uploadCsv(feedId: string, file: File) {
    const text = await file.text();
    runMutation.mutate({ id: feedId, csv: text });
  }

  const feeds = (data?.feeds ?? []) as any[];
  const runs = (data?.runs ?? []) as any[];
  const feedJob = (data?.jobs ?? []).find((j: any) => j.job_name === "feed_sync");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/admin">
            <ArrowLeft className="size-4" /> Back to products
          </Link>
        </Button>

        <h1 className="font-display text-2xl font-semibold tracking-tight">Price &amp; stock feeds</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every night the site downloads each retailer file and updates prices, stock and currency
          for offers it can match. Offers missing from a file are marked out of stock. Nothing new is
          created automatically — unmatched rows are listed so you can add them yourself.
        </p>

        {feedJob && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border p-3 text-sm">
            <span>
              Daily update:{" "}
              <strong>{feedJob.paused ? "paused" : "on"}</strong>
              {feedJob.last_run_at
                ? ` · last run ${new Date(feedJob.last_run_at).toLocaleString()} (${feedJob.last_status})`
                : " · not run yet"}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await pauseJob({ data: { job_name: "feed_sync", paused: !feedJob.paused } });
                refresh();
              }}
            >
              {feedJob.paused ? "Resume" : "Pause"}
            </Button>
          </div>
        )}

        {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="mt-6 text-sm text-destructive">{(error as Error).message}</p>}

        <div className="mt-6 space-y-3">
          {feeds.map((feed) => (
            <div key={feed.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{feed.merchant_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {feed.source_kind === "url"
                      ? feed.feed_url || "no link set"
                      : feed.source_kind === "email"
                        ? `emails from ${feed.from_email || "—"}`
                        : "manual uploads only"}
                    {feed.active ? "" : " · off"}
                  </p>
                  {feed.last_message && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last: {feed.last_status} — {feed.last_message}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={runMutation.isPending}
                    onClick={() => runMutation.mutate({ id: feed.id })}
                  >
                    <Play className="size-4" /> Run now
                  </Button>
                  <label className="inline-flex">
                    <input
                      type="file"
                      accept=".csv,.txt,.tsv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadCsv(feed.id, file);
                        e.target.value = "";
                      }}
                    />
                    <span className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-border px-3 text-sm">
                      <Upload className="size-4" /> Upload file
                    </span>
                  </label>
                  <Button size="sm" variant="ghost" onClick={() => setForm({ ...EMPTY, ...feed })}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm(`Delete the ${feed.merchant_name} feed?`)) return;
                      await remove({ data: { id: feed.id } });
                      refresh();
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button className="mt-4" size="sm" onClick={() => setForm({ ...EMPTY })}>
          <Plus className="size-4" /> Add a retailer feed
        </Button>

        {form && (
          <div className="mt-6 space-y-4 rounded-lg border border-border p-4">
            <h2 className="font-medium">{form.id ? "Edit feed" : "New feed"}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Retailer name (must match the offer merchant name)</Label>
                <Input
                  value={form.merchant_name}
                  onChange={(e) => setForm({ ...form, merchant_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Where the file comes from</Label>
                <select
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.source_kind}
                  onChange={(e) =>
                    setForm({ ...form, source_kind: e.target.value as FeedForm["source_kind"] })
                  }
                >
                  <option value="url">A web link the retailer gives me</option>
                  <option value="email">An email attachment from the retailer</option>
                  <option value="manual">I upload it myself</option>
                </select>
              </div>
              {form.source_kind === "url" && (
                <div className="sm:col-span-2">
                  <Label>File link</Label>
                  <Input
                    value={form.feed_url}
                    placeholder="https://…/products.csv"
                    onChange={(e) => setForm({ ...form, feed_url: e.target.value })}
                  />
                </div>
              )}
              {form.source_kind === "email" && (
                <div className="sm:col-span-2">
                  <Label>Retailer sender address</Label>
                  <Input
                    value={form.from_email}
                    placeholder="feeds@retailer.com"
                    onChange={(e) => setForm({ ...form, from_email: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium">Column names (leave blank to auto-detect)</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {MAPPING_FIELDS.map((field) => (
                  <div key={field}>
                    <Label className="text-xs capitalize">{field.replace("_", " ")}</Label>
                    <Input
                      value={form.mapping[field] ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, mapping: { ...form.mapping, [field]: e.target.value } })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Include in the nightly update
            </label>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
                Save feed
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setForm(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {runs.length > 0 && (
          <div className="mt-10">
            <h2 className="font-medium">Recent runs</h2>
            <div className="mt-2 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="p-2">When</th>
                    <th className="p-2">Trigger</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Rows</th>
                    <th className="p-2">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id} className="border-t border-border">
                      <td className="p-2">{new Date(run.started_at).toLocaleString()}</td>
                      <td className="p-2">{run.trigger}</td>
                      <td className="p-2">{run.status}</td>
                      <td className="p-2">{run.rows_total}</td>
                      <td className="p-2">{run.rows_updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
