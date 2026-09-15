import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileUp, Loader2 } from "lucide-react";
import { importCatalogRows } from "@/lib/admin.functions";
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

type Row = {
  brand: string;
  product_name: string;
  category: string;
  form: string;
  serving_size: string;
  merchant_name: string;
  country_flag: string;
  affiliate_network: string;
  price: number;
  currency: string;
  url: string;
  retailer_product_id: string;
};

const EXPECTED = [
  "brand",
  "product_name",
  "category",
  "form",
  "serving_size",
  "merchant_name",
  "country_flag",
  "affiliate_network",
  "price",
  "currency",
  "url",
  "retailer_product_id",
];

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field.trim());
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field.trim());
      field = "";
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  row.push(field.trim());
  if (row.some((v) => v !== "")) rows.push(row);
  return rows;
}

function toRows(text: string): Row[] {
  const table = parseCsv(text);
  if (table.length < 2) return [];
  const header = (table[0] ?? []).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  return table.slice(1).map((cells) => {
    const get = (key: string) => cells[header.indexOf(key)] ?? "";
    return {
      brand: get("brand"),
      product_name: get("product_name"),
      category: get("category"),
      form: get("form") || "Capsules",
      serving_size: get("serving_size"),
      merchant_name: get("merchant_name"),
      country_flag: get("country_flag") || "",
      affiliate_network: get("affiliate_network") || "direct",
      price: Number(get("price")) || 0,
      currency: get("currency") || "EUR",
      url: get("url"),
      retailer_product_id: get("retailer_product_id") || "",
    };
  });
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

  const rows = useMemo(() => (rawText ? toRows(rawText) : []), [rawText]);

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
      const res = await runImport({ data: rows });
      setResult(res as { created: number; offers: number; errors: string[] });
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
          Upload a supplier's product file (Excel .xlsx or .csv) or paste CSV text. One row per
          product-per-retailer: rows with the same product name merge into one product with
          multiple offers. Imported links start unverified — review and verify them from the admin
          list.
        </p>

        <div className="mt-5 rounded-lg border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Expected columns
          </p>
          <p className="num mt-1 break-all text-xs text-muted-foreground">{EXPECTED.join(", ")}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Input type="file" accept=".csv,.tsv,.txt,.xlsx,.xls" onChange={onFile} className="max-w-xs" />
            {fileName && (
              <span className="text-xs text-muted-foreground">
                {fileName} — {rows.length} rows detected
              </span>
            )}
          </div>
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
