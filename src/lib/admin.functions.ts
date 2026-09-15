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

/**
 * Sync the signed-in account against the admin allowlist.
 * Allow-listed email -> admin role. Everyone else -> newsletter subscriber only.
 */
export const bootstrapAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let email: string = context.claims?.email ?? "";
    if (!email) {
      const { data } = await supabaseAdmin.auth.admin.getUserById(context.userId);
      email = data.user?.email ?? "";
    }
    email = email.toLowerCase();
    if (!email) return { admin: false, bootstrapped: false };

    const { data: allowed } = await supabaseAdmin
      .from("admin_allowlist")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (allowed) {
      const { data: existing } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", context.userId)
        .eq("role", "admin")
        .maybeSingle();
      if (!existing) {
        await supabaseAdmin.from("user_roles").insert({ user_id: context.userId, role: "admin" });
        return { admin: true, bootstrapped: true };
      }
      return { admin: true, bootstrapped: false };
    }

    // Not allow-listed: make sure no stale admin role remains, and subscribe them.
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", context.userId)
      .eq("role", "admin");
    const { data: sub } = await supabaseAdmin
      .from("subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (!sub) {
      await supabaseAdmin.from("subscribers").insert({ email, source: "account" });
    }
    return { admin: false, bootstrapped: false };
  });

export const getAdminCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: { context: Ctx }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("products")
      .select(
        `id, name, slug, category, category_path, form, serving_size, primary_benefit,
         verified_advantages, trade_offs, excipients, third_party_certifications,
         brands ( id, name, country_of_origin, website_url ),
         merchant_offers ( id, merchant_name, country_flag, affiliate_network, price, currency,
           shipping_cost, estimated_delivery, affiliate_target_url, retailer_product_id,
           link_verified, link_verified_at, in_stock, updated_at )`,
      )
      .order("name");
    if (error) throw error;
    return data ?? [];
  });

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  brand_name: z.string().min(1).max(120),
  category: z.string().min(1).max(120),
  category_path: z.array(z.string().max(120)).max(8),
  form: z.string().min(1).max(60),
  serving_size: z.string().max(60),
  primary_benefit: z.string().max(300),
  verified_advantages: z.array(z.string().max(300)).max(10),
  trade_offs: z.array(z.string().max(300)).max(10),
  excipients: z.array(z.string().max(120)).max(20),
  third_party_certifications: z.array(z.string().max(120)).max(10),
});

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => productSchema.parse(data))
  .handler(async ({ context, data }: { context: Ctx; data: z.infer<typeof productSchema> }) => {
    await assertAdmin(context);
    const { id, brand_name, ...fields } = data;

    let { data: brand } = await context.supabase
      .from("brands")
      .select("id")
      .eq("name", brand_name)
      .maybeSingle();
    if (!brand) {
      const { data: created, error } = await context.supabase
        .from("brands")
        .insert({ name: brand_name })
        .select("id")
        .single();
      if (error) throw error;
      brand = created;
    }

    const payload = { ...fields, brand_id: brand.id };
    const { data: saved, error } = id
      ? await context.supabase.from("products").update(payload).eq("id", id).select("id, slug").single()
      : await context.supabase.from("products").insert(payload).select("id, slug").single();
    if (error) throw error;
    return saved;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }: { context: Ctx; data: { id: string } }) => {
    await assertAdmin(context);
    await context.supabase.from("merchant_offers").delete().eq("product_id", data.id);
    await context.supabase.from("product_ingredients").delete().eq("product_id", data.id);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

const offerSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  merchant_name: z.string().min(1).max(120),
  country_flag: z.string().max(8),
  affiliate_network: z.string().max(40),
  price: z.number().min(0).max(100000),
  currency: z.string().max(8),
  shipping_cost: z.number().min(0).max(10000),
  estimated_delivery: z.string().max(80),
  affiliate_target_url: z.string().url().max(2000),
  retailer_product_id: z.string().max(120),
  in_stock: z.boolean(),
  link_verified: z.boolean(),
});

export const saveOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => offerSchema.parse(data))
  .handler(async ({ context, data }: { context: Ctx; data: z.infer<typeof offerSchema> }) => {
    await assertAdmin(context);
    const { id, ...fields } = data;
    const payload = {
      ...fields,
      updated_at: new Date().toISOString(),
      link_verified_at: fields.link_verified ? new Date().toISOString() : null,
    };
    const { data: saved, error } = id
      ? await context.supabase.from("merchant_offers").update(payload).eq("id", id).select("id").single()
      : await context.supabase.from("merchant_offers").insert(payload).select("id").single();
    if (error) throw error;
    return saved;
  });

export const deleteOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }: { context: Ctx; data: { id: string } }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("merchant_offers").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

const importRowSchema = z.object({
  brand: z.string().min(1).max(120),
  product_name: z.string().min(2).max(200),
  category: z.string().min(1).max(120),
  form: z.string().max(60).default("Capsules"),
  serving_size: z.string().max(60).default(""),
  merchant_name: z.string().min(1).max(120),
  country_flag: z.string().max(8).default(""),
  affiliate_network: z.string().max(40).default("direct"),
  price: z.number().min(0).max(100000).default(0),
  currency: z.string().max(8).default("EUR"),
  url: z.string().url().max(2000),
  retailer_product_id: z.string().max(120).default(""),
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

export const importCatalogRows = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.array(importRowSchema).min(1).max(2000).parse(data))
  .handler(async ({ context, data }: { context: Ctx; data: z.infer<typeof importRowSchema>[] }) => {
    await assertAdmin(context);
    let created = 0;
    let offers = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        let { data: brand } = await context.supabase
          .from("brands")
          .select("id")
          .eq("name", row.brand)
          .maybeSingle();
        if (!brand) {
          const { data: b, error } = await context.supabase
            .from("brands")
            .insert({ name: row.brand })
            .select("id")
            .single();
          if (error) throw error;
          brand = b;
        }

        const slug = slugify(`${row.brand} ${row.product_name}`);
        let { data: product } = await context.supabase
          .from("products")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (!product) {
          const { data: p, error } = await context.supabase
            .from("products")
            .insert({
              brand_id: brand.id,
              name: row.product_name,
              slug,
              category: row.category,
              category_path: ["Supplements", row.category, row.product_name],
              form: row.form,
              serving_size: row.serving_size,
              primary_benefit: "",
            })
            .select("id")
            .single();
          if (error) throw error;
          product = p;
          created += 1;
        }

        const { data: existing } = await context.supabase
          .from("merchant_offers")
          .select("id")
          .eq("product_id", product.id)
          .eq("merchant_name", row.merchant_name)
          .maybeSingle();

        const offerPayload = {
          product_id: product.id,
          merchant_name: row.merchant_name,
          country_flag: row.country_flag,
          affiliate_network: row.affiliate_network,
          price: row.price,
          currency: row.currency,
          affiliate_target_url: row.url,
          retailer_product_id: row.retailer_product_id,
          in_stock: true,
          link_verified: false,
          link_verified_at: null,
          updated_at: new Date().toISOString(),
        };
        const { error } = existing
          ? await context.supabase.from("merchant_offers").update(offerPayload).eq("id", existing.id)
          : await context.supabase.from("merchant_offers").insert(offerPayload);
        if (error) throw error;
        offers += 1;
      } catch (err) {
        errors.push(`${row.product_name} / ${row.merchant_name}: ${(err as Error).message}`);
      }
    }
    return { created, offers, errors };
  });
