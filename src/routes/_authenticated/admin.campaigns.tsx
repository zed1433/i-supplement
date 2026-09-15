import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Eye, Inbox, Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteCampaign,
  draftFromText,
  listCampaigns,
  previewCampaign,
  saveCampaign,
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
      { title: "Offer emails | SuppCheck admin" },
      {
        name: "description",
        content: "Review, test and send rewritten retailer offers to SuppCheck subscribers.",
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

  const [sample, setSample] = useState("");
  const [editing, setEditing] = useState<{ id: string; subject: string; body: string } | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [testTo, setTestTo] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "campaigns"],
    queryFn: fetchCampaigns,
    retry: false,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "campaigns"] });

  const scanMutation = useMutation({
    mutationFn: () => scan({}),
    onSuccess: (r: any) => {
      toast.success(`${r.created} new drafts from ${r.scanned} emails`);
      refresh();
    },
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
          Nothing is ever sent until you approve it. Currently {data?.subscriberCount ?? 0}{" "}
          subscribers.
        </p>

        {data && !data.gmailConnected && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-sm">
            The email account is not connected yet, so inbox scanning and sending are off. You can
            still test everything below by pasting a sample offer.
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => scanMutation.mutate()} disabled={scanMutation.isPending}>
            <Inbox className="size-4" /> Check inbox now
          </Button>
        </div>

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
            <Sparkles className="size-4" /> Create a draft from this
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
                      if (!confirm("Send this to every subscriber?")) return;
                      try {
                        const r: any = await sendNow({ data: { id: c.id } });
                        toast.success(`Sent to ${r.sent} subscribers (${r.failed} failed)`);
                        refresh();
                      } catch (e) {
                        toast.error((e as Error).message);
                      }
                    }}
                  >
                    <Send className="size-4" /> Approve &amp; send
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
              <div
                className="prose prose-invert mt-3 max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: c.body }}
              />
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
