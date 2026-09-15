import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BadgeCheck, Loader2, Plus, Trash2 } from "lucide-react";
import { deleteOffer, deleteProduct, getAdminCatalog, saveOffer, saveProduct } from "@/lib/admin.functions";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

type Offer = {
  id: string;
  merchant_name: string;
  country_flag: string;
  affiliate_network: string;
  price: number;
  currency: string;
  shipping_cost: number;
  estimated_delivery: string;
  affiliate_target_url: string;
  retailer_product_id: string;
  link_verified: boolean;
  in_stock: boolean;
};

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  category_path: string[];
  form: string;
  serving_size: string;
  primary_benefit: string;
  verified_advantages: string[];
  trade_offs: string[];
  excipients: string[];
  third_party_certifications: string[];
  brands: { name: string };
  merchant_offers: Offer[];
};

export const Route = createFileRoute("/_authenticated/admin/product/$slug")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Edit Product — i-Supplement Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditProductPage,
});

function ListField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label} (one per line)
      </span>
      <Textarea
        rows={3}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
      />
    </label>
  );
}

function EditProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchCatalog = useServerFn(getAdminCatalog);
  const runSaveProduct = useServerFn(saveProduct);
  const runSaveOffer = useServerFn(saveOffer);
  const runDeleteOffer = useServerFn(deleteOffer);
  const runDeleteProduct = useServerFn(deleteProduct);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "catalog"],
    queryFn: fetchCatalog,
  });

  const product = ((data ?? []) as unknown as AdminProduct[]).find((p) => p.slug === slug);

  const [form, setForm] = useState<AdminProduct | null>(null);
  const [newOffer, setNewOffer] = useState<Partial<Offer> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (product && !form) setForm(structuredClone(product));
  }, [product, form]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <p className="mx-auto max-w-4xl px-4 py-12 text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <p className="mx-auto max-w-4xl px-4 py-12 text-sm text-muted-foreground">
          Product not found. <Link to="/admin" className="text-primary">Back to admin</Link>
        </p>
      </div>
    );
  }

  const set = <K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  async function save() {
    if (!form) return;
    setSaving(true);
    setMessage("");
    try {
      await runSaveProduct({
        data: {
          id: form.id,
          name: form.name,
          slug: form.slug,
          brand_name: form.brands.name,
          category: form.category,
          category_path: form.category_path,
          form: form.form,
          serving_size: form.serving_size,
          primary_benefit: form.primary_benefit,
          verified_advantages: form.verified_advantages,
          trade_offs: form.trade_offs,
          excipients: form.excipients,
          third_party_certifications: form.third_party_certifications,
        },
      });
      for (const offer of form.merchant_offers) {
        await runSaveOffer({
          data: {
            id: offer.id,
            product_id: form.id,
            merchant_name: offer.merchant_name,
            country_flag: offer.country_flag,
            affiliate_network: offer.affiliate_network,
            price: Number(offer.price),
            currency: offer.currency,
            shipping_cost: Number(offer.shipping_cost),
            estimated_delivery: offer.estimated_delivery,
            affiliate_target_url: offer.affiliate_target_url,
            retailer_product_id: offer.retailer_product_id,
            in_stock: offer.in_stock,
            link_verified: offer.link_verified,
          },
        });
      }
      if (newOffer?.merchant_name && newOffer?.affiliate_target_url) {
        await runSaveOffer({
          data: {
            product_id: form.id,
            merchant_name: newOffer.merchant_name,
            country_flag: newOffer.country_flag ?? "",
            affiliate_network: newOffer.affiliate_network ?? "direct",
            price: Number(newOffer.price ?? 0),
            currency: newOffer.currency ?? "EUR",
            shipping_cost: Number(newOffer.shipping_cost ?? 0),
            estimated_delivery: newOffer.estimated_delivery ?? "",
            affiliate_target_url: newOffer.affiliate_target_url,
            retailer_product_id: newOffer.retailer_product_id ?? "",
            in_stock: newOffer.in_stock ?? true,
            link_verified: newOffer.link_verified ?? false,
          },
        });
      }
      setNewOffer(null);
      setMessage("Saved.");
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      await queryClient.invalidateQueries({ queryKey: ["suppcheck"] });
    } catch (err) {
      setMessage(`Error: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  async function removeOffer(id: string) {
    await runDeleteOffer({ data: { id } });
    setForm((f) =>
      f ? { ...f, merchant_offers: f.merchant_offers.filter((o) => o.id !== id) } : f,
    );
    queryClient.invalidateQueries({ queryKey: ["admin"] });
  }

  async function removeProduct() {
    if (!form || !window.confirm(`Delete ${form.name} and all its offers?`)) return;
    await runDeleteProduct({ data: { id: form.id } });
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["suppcheck"] });
    navigate({ to: "/admin" });
  }

  const setOffer = (id: string, patch: Partial<Offer>) =>
    setForm((f) =>
      f
        ? {
            ...f,
            merchant_offers: f.merchant_offers.map((o) => (o.id === id ? { ...o, ...patch } : o)),
          }
        : f,
    );

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

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{form.name}</h1>
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={removeProduct}>
              <Trash2 className="size-4" /> Delete product
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save all changes
            </Button>
          </div>
        </div>
        {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}

        <section className="mt-6 grid gap-4 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Name</span>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Brand</span>
            <Input
              value={form.brands.name}
              onChange={(e) => set("brands", { ...form.brands, name: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Category</span>
            <Input value={form.category} onChange={(e) => set("category", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Form</span>
            <Input value={form.form} onChange={(e) => set("form", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Serving size
            </span>
            <Input
              value={form.serving_size}
              onChange={(e) => set("serving_size", e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Category path (one per line — must end with the full product name)
            </span>
            <Textarea
              rows={3}
              value={form.category_path.join("\n")}
              onChange={(e) =>
                set(
                  "category_path",
                  e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                )
              }
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Primary benefit
            </span>
            <Input
              value={form.primary_benefit}
              onChange={(e) => set("primary_benefit", e.target.value)}
            />
          </label>
          <ListField
            label="Verified advantages"
            value={form.verified_advantages}
            onChange={(v) => set("verified_advantages", v)}
          />
          <ListField
            label="Trade-offs"
            value={form.trade_offs}
            onChange={(v) => set("trade_offs", v)}
          />
          <ListField
            label="Excipients"
            value={form.excipients}
            onChange={(v) => set("excipients", v)}
          />
          <ListField
            label="Certifications"
            value={form.third_party_certifications}
            onChange={(v) => set("third_party_certifications", v)}
          />
        </section>

        <section className="mt-6 rounded-lg border border-border bg-surface p-4">
          <h2 className="font-display text-lg font-semibold">Merchant offers</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Paste the real affiliate link, then tick “Verified” after checking it opens the exact
            product. Only verified, in-stock links show buy buttons to visitors.
          </p>
          <div className="mt-4 space-y-4">
            {form.merchant_offers.map((offer) => (
              <div key={offer.id} className="rounded-md border border-border p-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block">
                    <span className="text-xs text-muted-foreground">Merchant</span>
                    <Input
                      value={offer.merchant_name}
                      onChange={(e) => setOffer(offer.id, { merchant_name: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-muted-foreground">Network</span>
                    <Input
                      value={offer.affiliate_network}
                      onChange={(e) => setOffer(offer.id, { affiliate_network: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-muted-foreground">Retailer product ID</span>
                    <Input
                      value={offer.retailer_product_id}
                      onChange={(e) => setOffer(offer.id, { retailer_product_id: e.target.value })}
                    />
                  </label>
                  <label className="block sm:col-span-3">
                    <span className="text-xs text-muted-foreground">Affiliate link URL</span>
                    <Input
                      value={offer.affiliate_target_url}
                      onChange={(e) =>
                        setOffer(offer.id, {
                          affiliate_target_url: e.target.value,
                          link_verified: false,
                        })
                      }
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-muted-foreground">Price</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={offer.price}
                      onChange={(e) => setOffer(offer.id, { price: Number(e.target.value) })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-muted-foreground">Currency</span>
                    <Input
                      value={offer.currency}
                      onChange={(e) => setOffer(offer.id, { currency: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-muted-foreground">Shipping cost</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={offer.shipping_cost}
                      onChange={(e) => setOffer(offer.id, { shipping_cost: Number(e.target.value) })}
                    />
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-5">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={offer.in_stock}
                      onCheckedChange={(v) => setOffer(offer.id, { in_stock: v === true })}
                    />
                    In stock
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={offer.link_verified}
                      onCheckedChange={(v) => setOffer(offer.id, { link_verified: v === true })}
                    />
                    <span className="flex items-center gap-1">
                      <BadgeCheck className="size-3.5 text-primary" /> Verified link
                    </span>
                  </label>
                  <a
                    href={offer.affiliate_target_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Test link
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-destructive"
                    onClick={() => removeOffer(offer.id)}
                  >
                    <Trash2 className="size-3.5" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-md border border-dashed border-border p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Add offer</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <Input
                placeholder="Merchant (e.g. Amazon.de)"
                value={newOffer?.merchant_name ?? ""}
                onChange={(e) =>
                  setNewOffer((o) => ({ ...o, merchant_name: e.target.value }))
                }
              />
              <Input
                placeholder="Network (amazon / awin / linkwise / direct)"
                value={newOffer?.affiliate_network ?? ""}
                onChange={(e) =>
                  setNewOffer((o) => ({ ...o, affiliate_network: e.target.value }))
                }
              />
              <Input
                placeholder="Retailer product ID (e.g. ASIN)"
                value={newOffer?.retailer_product_id ?? ""}
                onChange={(e) =>
                  setNewOffer((o) => ({ ...o, retailer_product_id: e.target.value }))
                }
              />
              <Input
                className="sm:col-span-2"
                placeholder="Affiliate link URL"
                value={newOffer?.affiliate_target_url ?? ""}
                onChange={(e) =>
                  setNewOffer((o) => ({ ...o, affiliate_target_url: e.target.value }))
                }
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Price EUR"
                value={newOffer?.price ?? ""}
                onChange={(e) => setNewOffer((o) => ({ ...o, price: Number(e.target.value) }))}
              />
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Plus className="size-3" /> The new offer is added when you press “Save all changes”.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
