// Offer-email ingestion, AI rewriting and newsletter sending. Server-only.
export const SITE_NAME = "i-Supplement";
export const SITE_URL =
  process.env["PUBLIC_SITE_URL"] ??
  "https://project--3a22ec09-24a9-45ec-9881-3eb081d306ce.lovable.app";

export const DEFAULT_RETAILER_TERMS = [
  "iherb",
  "amazon",
  "skroutz",
  "myprotein",
  "holland",
  "vitacost",
  "solgar",
  "now foods",
];

const PROMO_WORDS = ["off", "discount", "sale", "code", "coupon", "deal", "%", "εκπτωση", "προσφορ"];

/** Retailer names the admin keeps in settings. Empty list = accept any promo. */
export async function retailerTerms(): Promise<string[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "retailer_terms")
    .maybeSingle();
  const raw = data?.value ?? "";
  return raw
    .split(",")
    .map((s: string) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function looksPromotional(
  subject: string,
  from: string,
  body: string,
  terms: string[] = DEFAULT_RETAILER_TERMS,
): boolean {
  const haystack = `${subject} ${from}`.toLowerCase();
  const retailer = terms.length === 0 || terms.some((r) => haystack.includes(r));
  const promo = PROMO_WORDS.some((w) => `${subject} ${body}`.toLowerCase().includes(w));
  return retailer && promo;
}

type Draft = { subject: string; body: string; retailer: string };

/** Rewrite a retailer promo into our own newsletter copy. */
export async function rewriteOffer(rawText: string, retailerHint = ""): Promise<Draft> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const prompt = `You write short promotional emails for ${SITE_NAME}, an independent supplement comparison site.
Rewrite the retailer promotion below in our own words. Never copy sentences verbatim, never invent a discount that is not in the source, and keep any expiry date and discount code exactly as written.
Return STRICT JSON only: {"retailer": string, "subject": string, "body_html": string}.
The body_html must be simple HTML (<p>, <strong>, <ul>, <a>) of 80-150 words, end with a link to ${SITE_URL} labelled "Compare the products", and contain no unsubscribe text.

SOURCE (retailer hint: ${retailerHint || "unknown"}):
"""
${rawText.slice(0, 6000)}
"""`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.8-flash",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[ai] rewrite failed [${res.status}]: ${body}`);
    throw new Error(`AI rewrite failed [${res.status}]: ${body}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? "";
  const json = content.slice(content.indexOf("{"), content.lastIndexOf("}") + 1);
  let parsed: { retailer?: string; subject?: string; body_html?: string };
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("AI returned an unreadable draft; try again");
  }
  return {
    retailer: (parsed.retailer ?? retailerHint).slice(0, 120),
    subject: (parsed.subject ?? "A new supplement offer").slice(0, 200),
    body: parsed.body_html ?? "",
  };
}

export type ScanOutcome = { from: string; subject: string; result: string };

/** Scan the connected inbox and store new drafts. Bounded and idempotent. */
export async function scanInboxForOffers(limit = 50) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { listMessageIds, getMessage, messageText, header } = await import("@/lib/gmail.server");

  const terms = await retailerTerms();
  const termQuery = terms.length
    ? ` (category:promotions OR ${terms.map((t) => `"${t}"`).join(" OR ")})`
    : " category:promotions";
  const query = `newer_than:30d -in:chats${termQuery}`;

  const ids = await listMessageIds(query, limit);
  const outcomes: ScanOutcome[] = [];
  let created = 0;
  let skipped = 0;

  for (const id of ids) {
    const { data: existing } = await supabaseAdmin
      .from("campaigns")
      .select("id")
      .eq("source_message_id", id)
      .maybeSingle();
    if (existing) {
      skipped += 1;
      outcomes.push({ from: "", subject: "", result: "already imported" });
      continue;
    }

    const msg = await getMessage(id);
    const subject = header(msg, "Subject");
    const from = header(msg, "From");
    const date = header(msg, "Date");
    const text = messageText(msg);
    if (!looksPromotional(subject, from, text, terms)) {
      skipped += 1;
      outcomes.push({ from, subject, result: "not an offer" });
      continue;
    }

    try {
      const draft = await rewriteOffer(text, from);
      const { error } = await supabaseAdmin.from("campaigns").insert({
        source: "inbox",
        source_message_id: id,
        retailer: draft.retailer || from.slice(0, 120),
        subject: draft.subject,
        body: draft.body,
        raw_excerpt: text.slice(0, 4000),
        source_from: from.slice(0, 300),
        source_subject: subject.slice(0, 300),
        source_date: date ? new Date(date).toISOString() : null,
        status: "draft",
      });
      if (error) throw new Error(error.message);
      created += 1;
      outcomes.push({ from, subject, result: "draft created" });
    } catch (err) {
      outcomes.push({ from, subject, result: `failed: ${(err as Error).message.slice(0, 200)}` });
    }
  }
  return { scanned: ids.length, created, skipped, query, outcomes };
}

export function renderEmail(
  subject: string,
  bodyHtml: string,
  unsubscribeUrl: string,
  testNotice = false,
): string {
  const notice = testNotice
    ? `<p style="font-size:13px;color:#6b7280;margin:0 0 16px">This is a test copy sent to you only. Subscribers have not received it.</p>`
    : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#111827">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <p style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;margin:0 0 12px">${SITE_NAME}</p>
    ${notice}<h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(subject)}</h1>
    <div style="font-size:15px;line-height:1.6">${bodyHtml}</div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0" />
    <p style="font-size:12px;color:#6b7280">
      You are receiving this because you subscribed to ${SITE_NAME} offers.
      <a href="${unsubscribeUrl}" style="color:#6b7280">Unsubscribe</a>.
    </p>
  </div></body></html>`;
}

/** Plain-text twin of the HTML email — required for good inbox placement. */
export function renderText(subject: string, bodyHtml: string, unsubscribeUrl: string): string {
  const body = bodyHtml
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return `${SITE_NAME}\n\n${subject}\n\n${body}\n\nCompare the products: ${SITE_URL}\n\nYou are receiving this because you subscribed to ${SITE_NAME} offers.\nUnsubscribe: ${unsubscribeUrl}\n`;
}

/** Subject lines that shout get filtered — calm them down before sending. */
export function cleanSubject(subject: string): string {
  let out = subject.replace(/[!]{1,}/g, "").replace(/\s{2,}/g, " ").trim();
  const letters = out.replace(/[^A-Za-z]/g, "");
  const caps = letters.replace(/[^A-Z]/g, "").length;
  if (letters.length > 8 && caps / letters.length > 0.6) {
    out = out
      .toLowerCase()
      .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
  }
  return out.slice(0, 150);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c,
  );
}

export function unsubscribeUrl(token: string): string {
  return `${SITE_URL}/api/public/unsubscribe?token=${token}`;
}

export const LIST_ID = `i-supplement-offers.${new URL(SITE_URL).hostname}`;

/** Send a campaign to every subscribed recipient, in a bounded batch. */
export async function sendCampaign(campaignId: string, batchSize = 100) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { sendMail } = await import("@/lib/gmail.server");

  const { data: campaign, error } = await supabaseAdmin
    .from("campaigns")
    .select("id, subject, body, status")
    .eq("id", campaignId)
    .single();
  if (error || !campaign) throw new Error("Campaign not found");

  const subject = cleanSubject(campaign.subject);

  const { data: subscribers } = await supabaseAdmin
    .from("subscribers")
    .select("email, unsubscribe_token")
    .eq("status", "subscribed")
    .limit(batchSize);

  const { data: already } = await supabaseAdmin
    .from("campaign_sends")
    .select("email")
    .eq("campaign_id", campaignId);
  const done = new Set((already ?? []).map((r) => r.email));

  let sent = 0;
  let failed = 0;
  for (const sub of subscribers ?? []) {
    if (done.has(sub.email)) continue;
    const unsub = unsubscribeUrl(sub.unsubscribe_token);
    try {
      await sendMail({
        to: sub.email,
        subject,
        html: renderEmail(subject, campaign.body, unsub),
        text: renderText(subject, campaign.body, unsub),
        fromName: SITE_NAME,
        unsubscribeUrl: unsub,
        listId: LIST_ID,
      });
      await supabaseAdmin
        .from("campaign_sends")
        .insert({ campaign_id: campaignId, email: sub.email, status: "sent" });
      sent += 1;
    } catch (err) {
      await supabaseAdmin.from("campaign_sends").insert({
        campaign_id: campaignId,
        email: sub.email,
        status: "failed",
        error: (err as Error).message.slice(0, 500),
      });
      failed += 1;
    }
    // Pace the loop so a batch does not look like a blast.
    await new Promise((r) => setTimeout(r, 1200));
  }

  await supabaseAdmin
    .from("campaigns")
    .update({
      status: "sent",
      sent_count: sent,
      failed_count: failed,
      sent_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  return { sent, failed };
}
