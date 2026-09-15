// Retailer price/stock feed processing. Server-only.
import { parseCsvRecords, toNumber, toStock } from "@/lib/csv";

export type FeedMapping = {
  product_id?: string;
  url?: string;
  price?: string;
  currency?: string;
  stock?: string;
  image?: string;
  name?: string;
};

export type FeedResult = {
  rows_total: number;
  rows_matched: number;
  rows_updated: number;
  unmatched: { id: string; name: string; url: string }[];
  errors: string[];
};

const MAX_ROWS = 5000;

const DEFAULTS: Record<keyof FeedMapping, string[]> = {
  product_id: ["retailer_product_id", "product_id", "sku", "asin", "id", "mpn"],
  url: ["url", "product_url", "link", "aw_deep_link", "deeplink"],
  price: ["price", "search_price", "sale_price", "display_price"],
  currency: ["currency", "curr"],
  stock: ["stock", "in_stock", "availability", "stock_quantity", "is_in_stock"],
  image: ["image", "image_url", "merchant_image_url", "aw_image_url"],
  name: ["product_name", "name", "title"],
};

function pick(rec: Record<string, string>, mapping: FeedMapping, key: keyof FeedMapping) {
  const explicit = mapping[key]?.trim().toLowerCase();
  if (explicit && rec[explicit] !== undefined) return rec[explicit];
  for (const candidate of DEFAULTS[key]) {
    if (rec[candidate] !== undefined && rec[candidate] !== "") return rec[candidate];
  }
  return undefined;
}

function normalizeUrl(url: string): string {
  return url.trim().replace(/[?#].*$/, "").replace(/\/$/, "").toLowerCase();
}

/** Apply one retailer's CSV to existing merchant offers. Never creates offers. */
export async function applyFeedCsv(
  merchantName: string,
  csvText: string,
  mapping: FeedMapping,
): Promise<FeedResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const records = parseCsvRecords(csvText).slice(0, MAX_ROWS);
  const result: FeedResult = {
    rows_total: records.length,
    rows_matched: 0,
    rows_updated: 0,
    unmatched: [],
    errors: [],
  };

  const { data: offers, error } = await supabaseAdmin
    .from("merchant_offers")
    .select("id, product_id, retailer_product_id, affiliate_target_url, price, in_stock, currency")
    .eq("merchant_name", merchantName);
  if (error) throw error;

  const byId = new Map<string, (typeof offers)[number]>();
  const byUrl = new Map<string, (typeof offers)[number]>();
  for (const o of offers ?? []) {
    if (o.retailer_product_id) byId.set(o.retailer_product_id.trim().toLowerCase(), o);
    if (o.affiliate_target_url) byUrl.set(normalizeUrl(o.affiliate_target_url), o);
  }

  const seen = new Set<string>();

  for (const rec of records) {
    const rid = pick(rec, mapping, "product_id")?.trim() ?? "";
    const url = pick(rec, mapping, "url")?.trim() ?? "";
    const offer = (rid && byId.get(rid.toLowerCase())) || (url && byUrl.get(normalizeUrl(url)));
    if (!offer) {
      if (result.unmatched.length < 100) {
        result.unmatched.push({
          id: rid,
          name: pick(rec, mapping, "name") ?? "",
          url,
        });
      }
      continue;
    }
    result.rows_matched += 1;
    seen.add(offer.id);

    const price = toNumber(pick(rec, mapping, "price"));
    const stock = toStock(pick(rec, mapping, "stock"));
    const currency = pick(rec, mapping, "currency");
    const image = pick(rec, mapping, "image");

    const patch: {
      updated_at: string;
      price?: number;
      in_stock?: boolean;
      currency?: string;
      retailer_product_id?: string;
    } = { updated_at: new Date().toISOString() };
    if (price !== null && price > 0) patch.price = price;
    if (stock !== null) patch.in_stock = stock;
    if (currency) patch.currency = currency.slice(0, 8);
    if (rid && !offer.retailer_product_id) patch.retailer_product_id = rid;

    const { error: upErr } = await supabaseAdmin
      .from("merchant_offers")
      .update(patch)
      .eq("id", offer.id);
    if (upErr) {
      result.errors.push(`${offer.id}: ${upErr.message}`);
      continue;
    }
    result.rows_updated += 1;

    if (image && /^https?:\/\//i.test(image)) {
      await supabaseAdmin
        .from("products")
        .update({ image_url: image })
        .eq("id", offer.product_id)
        .eq("image_url", "");
    }
  }

  // Offers absent from the feed are treated as out of stock.
  const missing = (offers ?? []).filter((o) => !seen.has(o.id) && o.in_stock);
  for (const o of missing) {
    await supabaseAdmin
      .from("merchant_offers")
      .update({ in_stock: false, updated_at: new Date().toISOString() })
      .eq("id", o.id);
  }

  return result;
}

export async function fetchFeedText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "user-agent": "SuppCheck-FeedBot/1.0" } });
  if (!res.ok) throw new Error(`Feed download failed [${res.status}]`);
  const text = await res.text();
  if (text.length > 20_000_000) throw new Error("Feed file is too large");
  return text;
}

type FeedRow = {
  id: string;
  merchant_name: string;
  feed_url: string;
  source_kind: string;
  from_email: string;
  mapping: unknown;
  active: boolean;
};

/** Run one feed: download (or use supplied CSV) and apply it. */
export async function runFeed(
  feed: FeedRow,
  trigger: string,
  suppliedCsv?: string,
): Promise<FeedResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: run } = await supabaseAdmin
    .from("feed_runs")
    .insert({ feed_id: feed.id, trigger, status: "running" })
    .select("id")
    .single();

  try {
    let csv = suppliedCsv;
    if (!csv) {
      if (feed.source_kind === "email") {
        csv = await csvFromInbox(feed.from_email);
      } else {
        if (!feed.feed_url) throw new Error("No feed link configured");
        csv = await fetchFeedText(feed.feed_url);
      }
    }
    const result = await applyFeedCsv(feed.merchant_name, csv, (feed.mapping ?? {}) as FeedMapping);
    await supabaseAdmin
      .from("feed_runs")
      .update({
        status: result.errors.length ? "completed_with_errors" : "completed",
        rows_total: result.rows_total,
        rows_matched: result.rows_matched,
        rows_updated: result.rows_updated,
        unmatched: result.unmatched,
        errors: result.errors.slice(0, 20),
        finished_at: new Date().toISOString(),
      })
      .eq("id", run?.id ?? "");
    await supabaseAdmin
      .from("retailer_feeds")
      .update({
        last_run_at: new Date().toISOString(),
        last_status: "ok",
        last_message: `${result.rows_updated} offers updated from ${result.rows_total} rows`,
      })
      .eq("id", feed.id);
    return result;
  } catch (err) {
    const message = (err as Error).message;
    await supabaseAdmin
      .from("feed_runs")
      .update({ status: "failed", errors: [message], finished_at: new Date().toISOString() })
      .eq("id", run?.id ?? "");
    await supabaseAdmin
      .from("retailer_feeds")
      .update({
        last_run_at: new Date().toISOString(),
        last_status: "failed",
        last_message: message.slice(0, 500),
      })
      .eq("id", feed.id);
    throw err;
  }
}

/** Pull the newest CSV attachment sent by a retailer to the connected inbox. */
async function csvFromInbox(fromEmail: string): Promise<string> {
  if (!fromEmail) throw new Error("No sender address configured for this email feed");
  const { listMessageIds, getMessage, csvAttachments, getAttachment } = await import(
    "@/lib/gmail.server"
  );
  const ids = await listMessageIds(`from:${fromEmail} has:attachment newer_than:14d`, 10);
  for (const id of ids) {
    const msg = await getMessage(id);
    const attachments = csvAttachments(msg);
    const first = attachments[0];
    if (first) return getAttachment(id, first.attachmentId);
  }
  throw new Error(`No recent CSV attachment found from ${fromEmail}`);
}

/** Daily job: every active feed, bounded. */
export async function runAllFeeds(trigger: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: feeds } = await supabaseAdmin
    .from("retailer_feeds")
    .select("id, merchant_name, feed_url, source_kind, from_email, mapping, active")
    .eq("active", true)
    .limit(50);

  const summary: { merchant: string; ok: boolean; message: string }[] = [];
  for (const feed of (feeds ?? []) as FeedRow[]) {
    try {
      const r = await runFeed(feed, trigger);
      summary.push({
        merchant: feed.merchant_name,
        ok: true,
        message: `${r.rows_updated}/${r.rows_total} updated`,
      });
    } catch (err) {
      summary.push({ merchant: feed.merchant_name, ok: false, message: (err as Error).message });
    }
  }
  return summary;
}
