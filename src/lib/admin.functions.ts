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
    const { data: allowed } = await supabaseAdmin.from("admin_allowlist").select("id").eq("email", email).maybeSingle();
    if (allowed) {
      const { data: existing } = await supabaseAdmin.from("user_roles").select("id").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
      if (!existing) {
        await supabaseAdmin.from("user_roles").insert({ user_id: context.userId, role: "admin" });
        return { admin: true, bootstrapped: true };
      }
      return { admin: true, bootstrapped: false };
    }
    await supabaseAdmin.from("user_roles").delete().eq("user_id", context.userId).eq("role", "admin");
    const { data: sub } = await supabaseAdmin.from("subscribers").select("id").eq("email", email).maybeSingle();
    if (!sub) await supabaseAdmin.from("subscribers").insert({ email, source: "account" });
    return { admin: false, bootstrapped: false };
  });

export const getAdminCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: { context: Ctx }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("products").select(`id, name, slug, category, category_path, form, serving_size, pricing_basis, total_servings, net_weight_grams, serving_weight_grams, catalog_group, primary_benefit, verified_advantages, trade_offs, excipients, third_party_certifications, brands ( id, name, country_of_origin, website_url ), product_images ( id, image_url, image_type, display_order, source, alt_text, is_primary ), merchant_offers ( id, merchant_name, country_flag, affiliate_network, price, currency, shipping_cost, estimated_delivery, affiliate_target_url, retailer_product_id, link_verified, link_verified_at, in_stock, updated_at )`).order("name");
    if (error) throw error;
    return data ?? [];
  });

const productSchema = z.object({ id: z.string().uuid().optional(), name: z.string().min(2).max(200), slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/), brand_name: z.string().min(1).max(120), category: z.string().min(1).max(120), category_path: z.array(z.string().max(120)).max(8), form: z.string().min(1).max(60), serving_size: z.string().max(60), pricing_basis: z.enum(["per_serving", "bulk_powder"]).nullable(), total_servings: z.number().positive().nullable(), net_weight_grams: z.number().positive().nullable(), serving_weight_grams: z.number().positive().nullable(), catalog_group: z.enum(["Vitamins & Minerals", "Performance & Protein", "Nootropics & Focus", "Longevity"]).nullable(), primary_benefit: z.string().max(300), verified_advantages: z.array(z.string().max(300)).max(10), trade_offs: z.array(z.string().max(300)).max(10), excipients: z.array(z.string().max(120)).max(20), third_party_certifications: z.array(z.string().max(120)).max(10) });

export const saveProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => productSchema.parse(data)).handler(async ({ context, data }: { context: Ctx; data: z.infer<typeof productSchema> }) => {
  await assertAdmin(context);
  const { id, brand_name, ...fields } = data;
  let { data: brand } = await context.supabase.from("brands").select("id").eq("name", brand_name).maybeSingle();
  if (!brand) {
    const { data: created, error } = await context.supabase.from("brands").insert({ name: brand_name }).select("id").single();
    if (error) throw error;
    brand = created;
  }
  const payload = { ...fields, brand_id: brand.id };
  const { data: saved, error } = id ? await context.supabase.from("products").update(payload).eq("id", id).select("id, slug").single() : await context.supabase.from("products").insert(payload).select("id, slug").single();
  if (error) throw error;
  return saved;
});

export const deleteProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data)).handler(async ({ context, data }: { context: Ctx; data: { id: string } }) => {
  await assertAdmin(context);
  await context.supabase.from("merchant_offers").delete().eq("product_id", data.id);
  await context.supabase.from("product_ingredients").delete().eq("product_id", data.id);
  const { error } = await context.supabase.from("products").delete().eq("id", data.id);
  if (error) throw error;
  return { ok: true };
});

const photoSchema = z.object({ id: z.string().uuid().optional(), product_id: z.string().uuid(), image_url: z.string().max(2000).refine((value) => value.startsWith("https://") || value.startsWith("/__l5e/assets-v1/"), "Use an HTTPS image URL"), image_type: z.enum(["front", "label", "back", "gallery"]), display_order: z.number().int().min(0), alt_text: z.string().max(300), is_primary: z.boolean() });

export const saveProductPhoto = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => photoSchema.parse(data)).handler(async ({ context, data }: { context: Ctx; data: z.infer<typeof photoSchema> }) => {
  await assertAdmin(context);
  const { id, ...fields } = data;
  if (fields.is_primary) {
    const { error } = await context.supabase.from("product_images").update({ is_primary: false }).eq("product_id", fields.product_id).eq("is_primary", true);
    if (error) throw error;
  }
  const { data: saved, error } = id ? await context.supabase.from("product_images").update(fields).eq("id", id).eq("product_id", fields.product_id).select("id").single() : await context.supabase.from("product_images").insert({ ...fields, source: "Admin" }).select("id").single();
  if (error) throw error;
  if (fields.is_primary) {
    const { error: productError } = await context.supabase.from("products").update({ image_url: fields.image_url, image_source: "Admin" }).eq("id", fields.product_id);
    if (productError) throw productError;
  }
  return saved;
});

export const deleteProductPhoto = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => z.object({ id: z.string().uuid(), product_id: z.string().uuid() }).parse(data)).handler(async ({ context, data }: { context: Ctx; data: { id: string; product_id: string } }) => {
  await assertAdmin(context);
  const { data: photo, error: readError } = await context.supabase.from("product_images").select("is_primary").eq("id", data.id).eq("product_id", data.product_id).single();
  if (readError) throw readError;
  const { error } = await context.supabase.from("product_images").delete().eq("id", data.id).eq("product_id", data.product_id);
  if (error) throw error;
  if (photo.is_primary) {
    const { data: next } = await context.supabase.from("product_images").select("id, image_url").eq("product_id", data.product_id).order("display_order").limit(1).maybeSingle();
    if (next) {
      const { error: nextError } = await context.supabase.from("product_images").update({ is_primary: true }).eq("id", next.id);
      if (nextError) throw nextError;
    }
    const { error: productError } = await context.supabase.from("products").update({ image_url: next?.image_url ?? "", image_source: next ? "Admin" : "" }).eq("id", data.product_id);
    if (productError) throw productError;
  }
  return { ok: true };
});

const offerSchema = z.object({ id: z.string().uuid().optional(), product_id: z.string().uuid(), merchant_name: z.string().min(1).max(120), country_flag: z.string().max(8), affiliate_network: z.string().max(40), price: z.number().min(0).max(100000), currency: z.string().max(8), shipping_cost: z.number().min(0).max(10000), estimated_delivery: z.string().max(80), affiliate_target_url: z.string().url().max(2000), retailer_product_id: z.string().max(120), in_stock: z.boolean(), link_verified: z.boolean() });

export const saveOffer = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => offerSchema.parse(data)).handler(async ({ context, data }: { context: Ctx; data: z.infer<typeof offerSchema> }) => {
  await assertAdmin(context);
  const { id, ...fields } = data;
  const payload = { ...fields, updated_at: new Date().toISOString(), link_verified_at: fields.link_verified ? new Date().toISOString() : null };
  const { data: saved, error } = id ? await context.supabase.from("merchant_offers").update(payload).eq("id", id).select("id").single() : await context.supabase.from("merchant_offers").insert(payload).select("id").single();
  if (error) throw error;
  return saved;
});

export const deleteOffer = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data)).handler(async ({ context, data }: { context: Ctx; data: { id: string } }) => {
  await assertAdmin(context);
  const { error } = await context.supabase.from("merchant_offers").delete().eq("id", data.id);
  if (error) throw error;
  return { ok: true };
});

const importRowSchema = z.object({ brand: z.string().min(1).max(120), product_name: z.string().min(2).max(200), category: z.string().min(1).max(120), form: z.string().max(60).default("Capsules"), serving_size: z.string().max(60).default(""), pricing_basis: z.enum(["per_serving", "bulk_powder"]).nullable().default(null), total_servings: z.number().positive().nullable().default(null), net_weight_grams: z.number().positive().nullable().default(null), serving_weight_grams: z.number().positive().nullable().default(null), catalog_group: z.enum(["Vitamins & Minerals", "Performance & Protein", "Nootropics & Focus", "Longevity"]).nullable().default(null), merchant_name: z.string().min(1).max(120), country_flag: z.string().max(8).default(""), affiliate_network: z.string().max(40).default("direct"), price: z.number().min(0).max(100000).default(0), currency: z.string().max(8).default("EUR"), url: z.string().url().max(2000), retailer_product_id: z.string().max(120).default(""), image_url: z.string().max(2000).default(""), certifications: z.array(z.string().max(80)).max(30).default([]), verified: z.boolean().default(false) });

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180);
}

export const importCatalogRows = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.array(importRowSchema).min(1).max(300).parse(data))
  .handler(async ({ context, data }: { context: Ctx; data: z.infer<typeof importRowSchema>[] }) => {
    await assertAdmin(context);
    let created = 0;
    let offers = 0;
    const errors: string[] = [];
    const now = new Date().toISOString();
    const brandNames = [...new Set(data.map((row) => row.brand))];
    const { data: brandRows, error: brandReadError } = await context.supabase.from("brands").select("id, name").in("name", brandNames);
    if (brandReadError) throw brandReadError;
    const brandId = new Map<string, string>((brandRows ?? []).map((b: { id: string; name: string }) => [b.name, b.id]));
    const missingBrands = brandNames.filter((name) => !brandId.has(name));
    if (missingBrands.length) {
      const { data: inserted, error } = await context.supabase.from("brands").insert(missingBrands.map((name) => ({ name }))).select("id, name");
      if (error) throw error;
      for (const brand of inserted ?? []) brandId.set(brand.name, brand.id);
    }
    const prepared = data.map((row) => ({ row, slug: slugify(`${row.brand} ${row.product_name}`) }));
    const slugs = [...new Set(prepared.map((item) => item.slug).filter(Boolean))];
    const { data: productRows, error: productReadError } = await context.supabase.from("products").select("id, slug").in("slug", slugs);
    if (productReadError) throw productReadError;
    const productId = new Map<string, string>((productRows ?? []).map((p: { id: string; slug: string }) => [p.slug, p.id]));
    const seenSlug = new Set<string>();
    const createPayload = [];
    for (const item of prepared) {
      if (!item.slug || productId.has(item.slug) || seenSlug.has(item.slug)) continue;
      const brand = brandId.get(item.row.brand);
      if (!brand) { errors.push(`${item.row.product_name}: missing brand`); continue; }
      seenSlug.add(item.slug);
      createPayload.push({ brand_id: brand, name: item.row.product_name, slug: item.slug, category: item.row.category, category_path: ["Supplements", item.row.category, item.row.product_name], form: item.row.form, serving_size: item.row.serving_size, pricing_basis: item.row.pricing_basis, total_servings: item.row.total_servings, net_weight_grams: item.row.net_weight_grams, serving_weight_grams: item.row.serving_weight_grams, catalog_group: item.row.catalog_group, primary_benefit: "", image_url: item.row.image_url, image_source: item.row.image_url ? item.row.merchant_name : "", third_party_certifications: item.row.certifications });
    }
    if (createPayload.length) {
      const { data: inserted, error } = await context.supabase.from("products").insert(createPayload).select("id, slug");
      if (error) throw error;
      created += inserted?.length ?? 0;
      for (const product of inserted ?? []) productId.set(product.slug, product.id);
    }
    const retailerIds = [...new Set(data.map((row) => row.retailer_product_id).filter(Boolean))];
    const offerByKey = new Map<string, string>();
    if (retailerIds.length) {
      const { data: offerRows, error: offerReadError } = await context.supabase.from("merchant_offers").select("id, merchant_name, retailer_product_id").in("retailer_product_id", retailerIds);
      if (offerReadError) throw offerReadError;
      for (const offer of offerRows ?? []) offerByKey.set(`${offer.merchant_name}:${offer.retailer_product_id}`, offer.id);
    }
    const inserts = [];
    const updates: { id: string; payload: Record<string, unknown> }[] = [];
    for (const item of prepared) {
      const product = productId.get(item.slug);
      if (!product) { errors.push(`${item.row.product_name}: product was not saved`); continue; }
      const payload = { product_id: product, merchant_name: item.row.merchant_name, country_flag: item.row.country_flag, affiliate_network: item.row.affiliate_network, price: item.row.price, currency: item.row.currency, affiliate_target_url: item.row.url, retailer_product_id: item.row.retailer_product_id, in_stock: true, link_verified: item.row.verified, link_verified_at: item.row.verified ? now : null, updated_at: now };
      const existing = item.row.retailer_product_id ? offerByKey.get(`${item.row.merchant_name}:${item.row.retailer_product_id}`) : undefined;
      if (existing) updates.push({ id: existing, payload });
      else inserts.push(payload);
    }
    if (inserts.length) {
      const { error } = await context.supabase.from("merchant_offers").insert(inserts);
      if (error) throw error;
      offers += inserts.length;
    }
    for (let i = 0; i < updates.length; i += 25) {
      const results = await Promise.all(updates.slice(i, i + 25).map((item) => context.supabase.from("merchant_offers").update(item.payload).eq("id", item.id)));
      for (const result of results) { if (result.error) errors.push(result.error.message); else offers += 1; }
    }
    return { created, offers, errors };
  });
