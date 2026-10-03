/** Minimal RFC4180-ish CSV parser (also handles semicolon/tab delimiters). */
export function detectDelimiter(text: string): string {
  const sample = text.slice(0, 12000);
  const counts: Record<string, number> = { ",": 0, ";": 0, "\t": 0, "|": 0 };
  let quoted = false;
  for (let i = 0; i < sample.length; i += 1) {
    const ch = sample[i];
    if (ch === '"') {
      if (quoted && sample[i + 1] === '"') {
        i += 1;
        continue;
      }
      quoted = !quoted;
      continue;
    }
    if (quoted) continue;
    if (ch === "\n") break;
    if (ch in counts) counts[ch] += 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ",";
}

export function parseCsv(text: string, delimiter?: string): string[][] {
  const d = delimiter ?? detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === d) {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else if (ch !== "\r") field += ch;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/** Parse into objects keyed by lowercased header. */
export function parseCsvRecords(text: string): Record<string, string>[] {
  const table = parseCsv(text);
  const header = (table[0] ?? []).map((h) => h.trim().toLowerCase().replace(/^\ufeff/, ""));
  return table.slice(1).map((cells) => {
    const rec: Record<string, string> = {};
    header.forEach((h, idx) => {
      rec[h] = (cells[idx] ?? "").trim();
    });
    return rec;
  });
}

export function toNumber(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9,.-]/g, "").replace(/\.(?=\d{3}\b)/g, "");
  const normalized = cleaned.includes(",") && !cleaned.includes(".")
    ? cleaned.replace(",", ".")
    : cleaned.replace(/,/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function toStock(value: string | undefined): boolean | null {
  if (value == null || value === "") return null;
  const v = value.trim().toLowerCase();
  if (["in stock", "instock", "yes", "true", "1", "available", "y"].includes(v)) return true;
  if (["out of stock", "outofstock", "no", "false", "0", "unavailable", "n"].includes(v))
    return false;
  const n = Number(v);
  if (Number.isFinite(n)) return n > 0;
  return null;
}
