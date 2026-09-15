import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

async function assertAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden: admin role required");
}

/* ------------------------- feeds ------------------------- */

export const listFeeds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: feeds }, { data: runs }, { data: jobs }] = await Promise.all([
      supabaseAdmin.from("retailer_feeds").select("*").order("merchant_name"),
      supabaseAdmin
        .from("feed_runs")
        .select("id, feed_id, trigger, status, rows_total, rows_matched, rows_updated, errors, started_at")
        .order("started_at", { ascending: false })
        .limit(20),
      supabaseAdmin.from("job_state").select("*"),
    ]);
    const { gmailConfigured } = await import("@/lib/gmail.server");
    return {
      feeds: feeds ?? [],
      runs: runs ?? [],
      jobs: jobs ?? [],
      gmailConnected: gmailConfigured(),
    };
  });

const feedSchema = z.object({
  id: z.string().uuid().optional(),
  merchant_name: z.string().min(1).max(120),
  source_kind: z.enum(["url", "email", "manual"]),
  feed_url: z.string().max(2000).default(""),
  from_email: z.string().max(200).default(""),
  active: z.boolean(),
  mapping: z.record(z.string(), z.string().max(120)).default({}),
});

export const saveFeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => feedSchema.parse(data))
  .handler(async ({ context, data }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...fields } = data;
    const { data: saved, error } = id
      ? await supabaseAdmin.from("retailer_feeds").update(fields).eq("id", id).select("id").single()
      : await supabaseAdmin.from("retailer_feeds").insert(fields).select("id").single();
    if (error) throw error;
    return saved;
  });

export const deleteFeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("retailer_feeds").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const runFeedNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ id: z.string().uuid(), csv: z.string().max(20_000_000).optional() }).parse(data),
  )
  .handler(async ({ context, data }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { runFeed } = await import("@/lib/feeds.server");
    const { data: feed, error } = await supabaseAdmin
      .from("retailer_feeds")
      .select("id, merchant_name, feed_url, source_kind, from_email, mapping, active")
      .eq("id", data.id)
      .single();
    if (error || !feed) throw new Error("Feed not found");
    return runFeed(feed as never, "manual", data.csv);
  });

export const setJobPaused = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ job_name: z.string().max(40), paused: z.boolean() }).parse(data),
  )
  .handler(async ({ context, data }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("job_state")
      .update({ paused: data.paused, pause_reason: data.paused ? "paused by admin" : "", failures: 0 })
      .eq("job_name", data.job_name);
    return { ok: true };
  });

/* ---------------------- campaigns ---------------------- */

export const listCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { gmailConfigured } = await import("@/lib/gmail.server");
    const [{ data: campaigns }, { count }] = await Promise.all([
      supabaseAdmin.from("campaigns").select("*").order("created_at", { ascending: false }).limit(50),
      supabaseAdmin
        .from("subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", "subscribed"),
    ]);
    return {
      campaigns: campaigns ?? [],
      subscriberCount: count ?? 0,
      gmailConnected: gmailConfigured(),
    };
  });

export const scanInboxNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await assertAdmin(context);
    const { scanInboxForOffers } = await import("@/lib/newsletter.server");
    return scanInboxForOffers(10);
  });

export const draftFromText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ text: z.string().min(20).max(20000) }).parse(data))
  .handler(async ({ context, data }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { rewriteOffer } = await import("@/lib/newsletter.server");
    const draft = await rewriteOffer(data.text, "pasted sample");
    const { data: saved, error } = await supabaseAdmin
      .from("campaigns")
      .insert({
        source: "pasted",
        retailer: draft.retailer,
        subject: draft.subject,
        body: draft.body,
        raw_excerpt: data.text.slice(0, 2000),
        status: "draft",
      })
      .select("id")
      .single();
    if (error) throw error;
    return saved;
  });

export const saveCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        id: z.string().uuid(),
        subject: z.string().min(2).max(200),
        body: z.string().min(2).max(20000),
      })
      .parse(data),
  )
  .handler(async ({ context, data }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("campaigns")
      .update({ subject: data.subject, body: data.body })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("campaigns").delete().eq("id", data.id);
    return { ok: true };
  });

/** Dry run: who would receive it and what it looks like — nothing is sent. */
export const previewCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { renderEmail, unsubscribeUrl } = await import("@/lib/newsletter.server");
    const { data: campaign } = await supabaseAdmin
      .from("campaigns")
      .select("subject, body")
      .eq("id", data.id)
      .single();
    if (!campaign) throw new Error("Campaign not found");
    const { data: recipients, count } = await supabaseAdmin
      .from("subscribers")
      .select("email", { count: "exact" })
      .eq("status", "subscribed")
      .limit(25);
    return {
      html: renderEmail(campaign.subject, campaign.body, unsubscribeUrl("preview-token")),
      recipients: (recipients ?? []).map((r) => r.email),
      recipientCount: count ?? 0,
    };
  });

export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ id: z.string().uuid(), to: z.string().email().max(200) }).parse(data),
  )
  .handler(async ({ context, data }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { renderEmail, unsubscribeUrl } = await import("@/lib/newsletter.server");
    const { sendMail } = await import("@/lib/gmail.server");
    const { data: campaign } = await supabaseAdmin
      .from("campaigns")
      .select("subject, body")
      .eq("id", data.id)
      .single();
    if (!campaign) throw new Error("Campaign not found");
    await sendMail({
      to: data.to,
      subject: `[TEST] ${campaign.subject}`,
      html: renderEmail(campaign.subject, campaign.body, unsubscribeUrl("test-token")),
    });
    return { ok: true };
  });

export const sendCampaignNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }: any) => {
    await assertAdmin(context);
    const { sendCampaign } = await import("@/lib/newsletter.server");
    return sendCampaign(data.id);
  });

/* ---------------- settings & self test ---------------- */

export const getRetailerTerms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await assertAdmin(context);
    const { retailerTerms } = await import("@/lib/newsletter.server");
    return { terms: (await retailerTerms()).join(", ") };
  });

export const saveRetailerTerms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ terms: z.string().max(1000) }).parse(data))
  .handler(async ({ context, data }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("app_settings")
      .upsert(
        { key: "retailer_terms", value: data.terms, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
    return { ok: true };
  });

type Check = { name: string; ok: boolean; detail: string };

/** Run every moving part once and report pass/fail per item. */
export const runSelfTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const checks: Check[] = [];
    const step = async (name: string, fn: () => Promise<string>) => {
      try {
        checks.push({ name, ok: true, detail: await fn() });
      } catch (err) {
        checks.push({ name, ok: false, detail: (err as Error).message.slice(0, 400) });
      }
    };

    await step("Email account connected", async () => {
      const { gmailProfile } = await import("@/lib/gmail.server");
      const p = await gmailProfile();
      return p.emailAddress;
    });

    await step("Inbox search", async () => {
      const { listMessageIds } = await import("@/lib/gmail.server");
      const { retailerTerms } = await import("@/lib/newsletter.server");
      const terms = await retailerTerms();
      const q = terms.length
        ? `newer_than:30d -in:chats (category:promotions OR ${terms.map((t) => `"${t}"`).join(" OR ")})`
        : "newer_than:30d -in:chats category:promotions";
      const ids = await listMessageIds(q, 25);
      return `${ids.length} matching emails in the last 30 days`;
    });

    await step("Rewriting offers with AI", async () => {
      const { rewriteOffer } = await import("@/lib/newsletter.server");
      const draft = await rewriteOffer(
        "iHerb: 15% off all vitamins this week with code VIT15. Offer ends Sunday.",
        "iHerb",
      );
      return `sample rewritten: "${draft.subject}"`;
    });

    await step("Subscriber list", async () => {
      const { count } = await supabaseAdmin
        .from("subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", "subscribed");
      return `${count ?? 0} people would receive a send`;
    });

    await step("Price & stock files", async () => {
      const { data: feeds } = await supabaseAdmin
        .from("retailer_feeds")
        .select("merchant_name, active, last_run_at, last_status")
        .order("merchant_name");
      if (!feeds || feeds.length === 0) return "no retailer files added yet";
      return feeds
        .map(
          (f: any) =>
            `${f.merchant_name}: ${f.active ? "on" : "off"}${f.last_status ? `, last run ${f.last_status}` : ", never run"}`,
        )
        .join(" · ");
    });

    await step("Nightly jobs", async () => {
      const { data: jobs } = await supabaseAdmin.from("job_state").select("*");
      if (!jobs || jobs.length === 0) return "no runs recorded yet";
      return jobs
        .map(
          (j: any) =>
            `${j.job_name}: ${j.paused ? "paused" : "active"}${j.last_run_at ? `, last ${new Date(j.last_run_at).toLocaleString()}` : ", never run"}${j.last_status ? ` (${j.last_status})` : ""}`,
        )
        .join(" · ");
    });

    return { checks };
  });

/* ---------------- admins & subscribers ---------------- */

export const listPeople = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: admins }, { data: subscribers, count }] = await Promise.all([
      supabaseAdmin.from("admin_allowlist").select("id, email, created_at").order("email"),
      supabaseAdmin
        .from("subscribers")
        .select("id, email, status, source, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    return { admins: admins ?? [], subscribers: subscribers ?? [], subscriberCount: count ?? 0 };
  });

export const addAdminEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ email: z.string().email().max(200) }).parse(data))
  .handler(async ({ context, data }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("admin_allowlist")
      .insert({ email: data.email.toLowerCase() });
    if (error && !error.message.includes("duplicate")) throw error;
    return { ok: true };
  });

export const removeAdminEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }: any) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("admin_allowlist")
      .select("id", { count: "exact", head: true });
    if ((count ?? 0) <= 1) throw new Error("At least one admin email must remain");

    const { data: row } = await supabaseAdmin
      .from("admin_allowlist")
      .select("email")
      .eq("id", data.id)
      .maybeSingle();
    await supabaseAdmin.from("admin_allowlist").delete().eq("id", data.id);

    if (row?.email) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const user = users?.users.find((u) => u.email?.toLowerCase() === row.email.toLowerCase());
      if (user) {
        await supabaseAdmin.from("user_roles").delete().eq("user_id", user.id).eq("role", "admin");
      }
    }
    return { ok: true };
  });

/* ------------------ public subscribe ------------------ */

export const subscribeEmail = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ email: z.string().email().max(200) }).parse(data))
  .handler(async ({ data }: any) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();
    const { data: existing } = await supabaseAdmin
      .from("subscribers")
      .select("id, status")
      .eq("email", email)
      .maybeSingle();
    if (existing) {
      if (existing.status !== "subscribed") {
        await supabaseAdmin
          .from("subscribers")
          .update({ status: "subscribed" })
          .eq("id", existing.id);
      }
      return { ok: true, alreadySubscribed: true };
    }
    const { error } = await supabaseAdmin
      .from("subscribers")
      .insert({ email, source: "website" });
    if (error) throw error;
    return { ok: true, alreadySubscribed: false };
  });
