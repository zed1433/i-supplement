import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileUp, Loader2 } from "lucide-react";
import { importCatalogRows } from "@/lib/admin.functions";
import { EXPECTED, parseImport } from "@/lib/importMapping";
import { detectDelimiter } from "@/lib/csv";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/import")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Bulk Import — i-Supplement Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ImportPage,
});

function separatorLabel(text: string): string {
  const delimiter = detectDelimiter(text);
  if (delimiter === ";") return "semicolon";
  if (delimiter === ",") return "comma";
  if (delimiter === "\t") return "tab";
  if (delimiter === "|") return "pipe";
  return "comma";
}

function ImportPage() {
  const queryClient = useQueryClient();
  const runImport = useServerFn(importCatalogRows);
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ created: number; offers: number; errors: string[] } | null>(
    null,
  );

  const parsed = useMemo(() => parseImport(rawText), [rawText]);
  const rows = parsed.rows;
  const [progress, setProgress] = useState("");

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    if (/\.(xlsx|xls)$/i.test(file.name)) {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer);
      const firstName = wb.SheetNames[0];
      const sheet = firstName ? wb.Sheets[firstName] : undefined;
      if (!sheet) throw new Error("No worksheet found in file");
      setRawText(XLSX.utils.sheet_to_csv(sheet));
    } else {
      setRawText(await file.text());
    }
  }

  async function submit() {
    setBusy(true);
    setResult(null);
    try {
      const total = { created: 0, offers: 0, errors: [] as string[] };
      for (let i = 0; i < rows.length; i += 100) {
        setProgress(`Importing ${Math.min(i + 100, rows.length)} / ${rows.length}…`);
        try {
          const res = (await runImport({ data: rows.slice(i, i + 100) })) as typeof total;
          total.created += res.created;
          total.offers += res.offers;
          total.errors.push(...res.errors);
        } catch (err) {
          total.errors.push(`Rows ${i + 1}-${i + 100}: ${(err as Error).message}`);
        }
        setResult({ ...total });
      }
      setProgress("");
      queryClient.invalidateQueries({ queryKey: ["suppcheck"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    } catch (err) {
      setResult({ created: 0, offers: 0, errors: [(err as Error).message] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          to="/admin"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to admin
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
          Bulk import supplier catalogues
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload the iHerb CSV from the scraper. Semicolon and comma files both work. One row per
          product: a second import updates the iHerb offer instead of adding a duplicate. iHerb
          links get the NBO7379 referral code if it is missing.
        </p>

        <div className="mt-5 rounded-lg border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Expected columns
          </p>
          <p className="num mt-1 break-all text-xs text-muted-foreground">{EXPECTED.join(", ")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            iHerb headers title, product_url, item_id, portion_size and image_url are recognised.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Input type="file" accept=".csv,.tsv,.txt,.xlsx,.xls" onChange={onFile} className="max-w-xs" />
            {fileName && (
              <span className="text-xs text-muted-foreground">
                {fileName} — {separatorLabel(rawText)} separator — {rows.length} products ready
              </span>
            )}
          </div>
          {rawText && (
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <p>Recognised columns: {parsed.recognised.join(", ") || "none"}</p>
              {parsed.ignored.length > 0 && <p>Ignored columns: {parsed.ignored.join(", ")}</p>}
              {parsed.skipped.length > 0 && (
                <details>
                  <summary className="cursor-pointer text-destructive">{parsed.skipped.length} rows skipped</summary>
                  {parsed.skipped.slice(0, 50).map((m) => <p key={m}>{m}</p>)}
                </details>
              )}
            </div>
          )}
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="…or paste CSV text here"
            rows={6}
            className="mt-4 w-full rounded-md border border-border bg-background p-3 font-mono text-xs"
          />
        </div>

        {rows.length > 0 && (
          <div className="mt-5 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-raised text-left uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Brand</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Merchant</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">URL</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">{r.product_name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.brand}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.category}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.merchant_name}</td>
                    <td className="px-3 py-2 num">
                      {r.price} {r.currency}
                    </td>
                    <td className="max-w-[220px] truncate px-3 py-2 text-muted-foreground">{r.url}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 20 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                …and {rows.length - 20} more rows
              </p>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={submit} disabled={rows.length === 0 || busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
            Import {rows.length > 0 ? `${rows.length} rows` : ""}
          </Button>
          {progress && <span className="text-sm text-muted-foreground">{progress}</span>}
          {result && (
            <div className="text-sm">
              <p>
                Added {result.created} products, {result.offers} offers.
              </p>
              {result.errors.slice(0, 5).map((e, i) => (
                <p key={i} className="text-xs text-destructive">
                  {e}
                </p>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
