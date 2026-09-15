// Offer-email ingestion, AI rewriting and newsletter sending. Server-only.
export const SITE_NAME = "SuppCheck";
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

/** Scan the connected inbox and store new drafts. Bounded and idempotent. */
export async function scanInboxForOffers(limit = 10) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { listMessageIds, getMessage, messageText, header } = await import("@/lib/gmail.server");

  const ids = await listMessageIds("newer_than:3d -in:chats", limit);
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
      continue;
    }

    const msg = await getMessage(id);
    const subject = header(msg, "Subject");
    const from = header(msg, "From");
    const text = messageText(msg);
    if (!looksPromotional(subject, from, text)) {
      skipped += 1;
      continue;
    }

    const draft = await rewriteOffer(text, from);
    const { error } = await supabaseAdmin.from("campaigns").insert({
      source: "inbox",
      source_message_id: id,
      retailer: draft.retailer || from.slice(0, 120),
      subject: draft.subject,
      body: draft.body,
      raw_excerpt: `${subject}\n\n${text}`.slice(0, 2000),
      status: "draft",
    });
    if (!error) created += 1;
  }
  return { scanned: ids.length, created, skipped };
}

export function renderEmail(subject: string, bodyHtml: string, unsubscribeUrl: string): string {
  return `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#111827">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <p style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;margin:0 0 12px">${SITE_NAME}</p>
    <h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(subject)}</h1>
    <div style="font-size:15px;line-height:1.6">${bodyHtml}</div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0" />
    <p style="font-size:12px;color:#6b7280">
      You are receiving this because you subscribed to ${SITE_NAME} offers.
      <a href="${unsubscribeUrl}" style="color:#6b7280">Unsubscribe</a>.
    </p>
  </div></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c,
  );
}

export function unsubscribeUrl(token: string): string {
  return `${SITE_URL}/api/public/unsubscribe?token=${token}`;
}

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
    try {
      await sendMail({
        to: sub.email,
        subject: campaign.subject,
        html: renderEmail(campaign.subject, campaign.body, unsubscribeUrl(sub.unsubscribe_token)),
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
