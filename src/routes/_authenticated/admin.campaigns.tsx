import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Inbox,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteCampaign,
  draftFromText,
  getRetailerTerms,
  listCampaigns,
  previewCampaign,
  runSelfTest,
  saveCampaign,
  saveRetailerTerms,
  scanInboxNow,
  sendCampaignNow,
  sendTestEmail,
} from "@/lib/automation.functions";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/campaigns")({
  head: () => ({
    meta: [
      { title: "Offer emails | i-Supplement admin" },
      {
        name: "description",
        content: "Review, test and send rewritten retailer offers to i-Supplement subscribers.",
      },
    ],
  }),
  component: CampaignsPage,
});

function CampaignsPage() {
  const qc = useQueryClient();
  const fetchCampaigns = useServerFn(listCampaigns);
  const scan = useServerFn(scanInboxNow);
  const fromText = useServerFn(draftFromText);
  const save = useServerFn(saveCampaign);
  const remove = useServerFn(deleteCampaign);
  const preview = useServerFn(previewCampaign);
  const test = useServerFn(sendTestEmail);
  const sendNow = useServerFn(sendCampaignNow);
  const selfTest = useServerFn(runSelfTest);
  const fetchTerms = useServerFn(getRetailerTerms);
  const storeTerms = useServerFn(saveRetailerTerms);

  const [sample, setSample] = useState("");
  const [editing, setEditing] = useState<{ id: string; subject: string; body: string } | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [testTo, setTestTo] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [checks, setChecks] = useState<{ name: string; ok: boolean; detail: string }[] | null>(null);
  const [terms, setTerms] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "campaigns"],
    queryFn: fetchCampaigns,
    retry: false,
  });
  useQuery({
    queryKey: ["admin", "retailer-terms"],
    queryFn: async () => {
      const r: any = await fetchTerms();
      setTerms(r.terms);
      return r;
    },
    retry: false,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "campaigns"] });

  const scanMutation = useMutation({
    mutationFn: () => scan({}),
    onSuccess: (r: any) => {
      setScanResult(r);
      toast.success(`${r.created} new drafts from ${r.scanned} emails`);
      refresh();
    },
    onError: (e: Error) => {
      setScanResult({ error: e.message });
      toast.error(e.message);
    },
  });

  const testMutation = useMutation({
    mutationFn: () => selfTest({}),
    onSuccess: (r: any) => setChecks(r.checks),
    onError: (e: Error) => toast.error(e.message),
  });

  const sampleMutation = useMutation({
    mutationFn: () => fromText({ data: { text: sample } }),
    onSuccess: () => {
      toast.success("Draft created from your sample");
      setSample("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const campaigns = (data?.campaigns ?? []) as any[];
  const subscriberCount = data?.subscriberCount ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/admin">
            <ArrowLeft className="size-4" /> Back to products
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Offer emails</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Retailer promotions arriving in your inbox are rewritten into your own wording as drafts.
          You see the original and the rewrite side by side, and nothing is sent until you approve
          it. Currently {subscriberCount} subscribers.
        </p>

        <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <p className="font-medium">Why some emails land in spam</p>
          <p className="mt-1 text-muted-foreground">
            Emails are currently sent from a normal Gmail address. Gmail and Outlook treat bulk mail
            from a personal address as suspicious no matter how it is written, so it often lands in
            spam. The emails now include a plain-text version, a proper sender name and a one-click
            unsubscribe, which helps — but the real fix is sending from your own domain
            (i-supplement.com) once it is bought and verified. After that, inbox placement becomes
            reliable. In the meantime, ask your first subscribers to mark the email "Not spam" and
            add the sender to their contacts.
          </p>
        </div>

        {data && !data.gmailConnected && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-sm">
            The email account is not connected yet, so inbox checking and sending are off. You can
            still test everything below by pasting a sample offer.
          </div>
        )}

        {/* ---------- self test ---------- */}
        <section className="mt-6 rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-medium">Check everything works</h2>
              <p className="text-sm text-muted-foreground">
                Runs each part once and tells you exactly what fails.
              </p>
            </div>
            <Button size="sm" onClick={() => testMutation.mutate()} disabled={testMutation.isPending}>
              {testMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Run the checks
            </Button>
          </div>
          {checks && (
            <ul className="mt-3 space-y-2 text-sm">
              {checks.map((c) => (
                <li key={c.name} className="flex gap-2">
                  {c.ok ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  )}
                  <span>
                    <span className="font-medium">{c.name}:</span>{" "}
                    <span className="text-muted-foreground">{c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---------- inbox check ---------- */}
        <section className="mt-6 rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-medium">Check the inbox for offers</h2>
              <p className="text-sm text-muted-foreground">
                Looks at the last 30 days of promotional mail from the retailers below.
              </p>
            </div>
            <Button size="sm" onClick={() => scanMutation.mutate()} disabled={scanMutation.isPending}>
              {scanMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Inbox className="size-4" />
              )}
              {scanMutation.isPending ? "Checking…" : "Check inbox now"}
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div className="min-w-64 flex-1">
              <Label>Retailer names to look for (comma separated, empty = all promotions)</Label>
              <Input
                className="mt-1"
                value={terms ?? ""}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="iherb, amazon, myprotein"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await storeTerms({ data: { terms: terms ?? "" } });
                toast.success("Retailer list saved");
              }}
            >
              Save list
            </Button>
          </div>

          {scanResult && (
            <div className="mt-3 rounded-md border border-border bg-muted/20 p-3 text-sm">
              {scanResult.error ? (
                <p className="text-destructive">{scanResult.error}</p>
              ) : (
                <>
                  <p>
                    Read {scanResult.scanned} emails · {scanResult.created} new drafts ·{" "}
                    {scanResult.skipped} skipped
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {(scanResult.outcomes ?? []).map((o: any, i: number) => (
                      <li key={i}>
                        {o.from || "(already seen)"} — {o.subject} → {o.result}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-lg border border-border p-4">
          <Label>Test with a pasted offer email</Label>
          <Textarea
            className="mt-2"
            rows={5}
            placeholder="Paste the text of a retailer offer email here…"
            value={sample}
            onChange={(e) => setSample(e.target.value)}
          />
          <Button
            className="mt-2"
            size="sm"
            disabled={sample.trim().length < 20 || sampleMutation.isPending}
            onClick={() => sampleMutation.mutate()}
          >
            {sampleMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Create a draft from this
          </Button>
        </section>

        {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="mt-6 text-sm text-destructive">{(error as Error).message}</p>}

        <div className="mt-6 space-y-3">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{c.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.retailer} · {c.status}
                    {c.sent_at ? ` · sent ${new Date(c.sent_at).toLocaleString()}` : ""}
                    {c.status === "sent" ? ` · ${c.sent_count} sent, ${c.failed_count} failed` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing({ id: c.id, subject: c.subject, body: c.body })}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const r: any = await preview({ data: { id: c.id } });
                        setPreviewHtml(r.html);
                        toast.success(`Dry run: would go to ${r.recipientCount} subscribers`);
                      } catch (e) {
                        toast.error((e as Error).message);
                      }
                    }}
                  >
                    <Eye className="size-4" /> Dry run
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const to = testTo || prompt("Send a test copy to which address?") || "";
                      if (!to) return;
                      setTestTo(to);
                      try {
                        await test({ data: { id: c.id, to } });
                        toast.success(`Test sent to ${to}`);
                      } catch (e) {
                        toast.error((e as Error).message);
                      }
                    }}
                  >
                    Send test
                  </Button>
                  <Button
                    size="sm"
                    disabled={c.status === "sent"}
                    onClick={async () => {
                      if (!confirm(`Send this to ${subscriberCount} subscribers?`)) return;
                      try {
                        const r: any = await sendNow({ data: { id: c.id } });
                        toast.success(`Sent to ${r.sent} subscribers (${r.failed} failed)`);
                        refresh();
                      } catch (e) {
                        toast.error((e as Error).message);
                      }
                    }}
                  >
                    <Send className="size-4" /> Send to {subscriberCount} subscribers
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm("Delete this draft?")) return;
                      await remove({ data: { id: c.id } });
                      refresh();
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Original email
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.source_from || c.source || "pasted sample"}
                    {c.source_date ? ` · ${new Date(c.source_date).toLocaleString()}` : ""}
                  </p>
                  {c.source_subject && <p className="mt-1 text-sm font-medium">{c.source_subject}</p>}
                  <p className="mt-2 max-h-60 overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground">
                    {c.raw_excerpt || "—"}
                  </p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Your rewritten version
                  </p>
                  <p className="mt-1 text-sm font-medium">{c.subject}</p>
                  <div
                    className="prose prose-invert mt-2 max-h-60 max-w-none overflow-y-auto text-sm"
                    dangerouslySetInnerHTML={{ __html: c.body }}
                  />
                </div>
              </div>
            </div>
          ))}
          {!isLoading && campaigns.length === 0 && (
            <p className="text-sm text-muted-foreground">No drafts yet.</p>
          )}
        </div>

        {editing && (
          <div className="mt-6 space-y-3 rounded-lg border border-border p-4">
            <h2 className="font-medium">Edit draft</h2>
            <div>
              <Label>Subject</Label>
              <Input
                value={editing.subject}
                onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>Body (simple HTML)</Label>
              <Textarea
                rows={8}
                value={editing.body}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  await save({ data: editing });
                  setEditing(null);
                  refresh();
                  toast.success("Draft saved");
                }}
              >
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {previewHtml && (
          <div className="mt-6 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Dry-run preview</h2>
              <Button size="sm" variant="ghost" onClick={() => setPreviewHtml(null)}>
                Close
              </Button>
            </div>
            <iframe
              title="Email preview"
              className="mt-3 h-96 w-full rounded border border-border bg-white"
              srcDoc={previewHtml}
            />
          </div>
        )}
      </main>
    </div>
  );
}
