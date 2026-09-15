import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, FileUp, LogOut, Pencil } from "lucide-react";
import { bootstrapAdmin, getAdminCatalog } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { Button } from "@/components/ui/button";

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  brands: { name: string };
  merchant_offers: { id: string; link_verified: boolean; in_stock: boolean }[];
};

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const runBootstrap = useServerFn(bootstrapAdmin);
  const fetchCatalog = useServerFn(getAdminCatalog);

  const { data: boot, isFetched: booted } = useQuery({
    queryKey: ["admin", "bootstrap"],
    queryFn: runBootstrap,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "catalog"],
    queryFn: fetchCatalog,
    enabled: !!boot?.admin,
    retry: false,
  });

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/" });
  }

  const products = (data ?? []) as unknown as AdminProduct[];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Catalogue admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Edit products, paste real affiliate links, and mark links verified so buy buttons go
              live for visitors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/import">
                <FileUp className="size-4" /> Bulk import
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>

        {booted && boot && !boot.admin && (
          <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
            This account is not an admin. An admin account already exists for this site — sign in
            with that Google account.
          </div>
        )}

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading catalogue…</p>}
        {error && (
          <p className="mt-8 text-sm text-destructive">
            Could not load catalogue: {(error as Error).message}
          </p>
        )}

        {products.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-raised text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Offers</th>
                  <th className="px-4 py-3">Verified links</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const verified = p.merchant_offers.filter((o) => o.link_verified).length;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brands?.name}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                      <td className="px-4 py-3 num">{p.merchant_offers.length}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs ${
                            verified > 0
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          <BadgeCheck className="size-3" />
                          {verified}/{p.merchant_offers.length}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link to="/admin/product/$slug" params={{ slug: p.slug }}>
                            <Pencil className="size-3.5" /> Edit
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
