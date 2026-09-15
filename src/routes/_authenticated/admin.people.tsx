import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addAdminEmail, listPeople, removeAdminEmail } from "@/lib/automation.functions";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/people")({
  head: () => ({
    meta: [
      { title: "Admins & subscribers | i-Supplement admin" },
      { name: "description", content: "Manage who can edit i-Supplement and who receives offers." },
    ],
  }),
  component: PeoplePage,
});

function PeoplePage() {
  const qc = useQueryClient();
  const fetchPeople = useServerFn(listPeople);
  const addAdmin = useServerFn(addAdminEmail);
  const removeAdmin = useServerFn(removeAdminEmail);
  const [email, setEmail] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "people"],
    queryFn: fetchPeople,
    retry: false,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "people"] });

  const admins = (data?.admins ?? []) as any[];
  const subscribers = (data?.subscribers ?? []) as any[];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/admin">
            <ArrowLeft className="size-4" /> Back to products
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Admins &amp; subscribers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Only the email addresses listed here can edit the catalogue. Everyone else who signs in
          just gets an account and offer emails.
        </p>

        {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="mt-6 text-sm text-destructive">{(error as Error).message}</p>}

        <section className="mt-6 rounded-lg border border-border p-4">
          <h2 className="font-medium">Admin emails</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2">
                <span>{a.email}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await removeAdmin({ data: { id: a.id } });
                      refresh();
                    } catch (e) {
                      toast.error((e as Error).message);
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="new.admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await addAdmin({ data: { email } });
                  setEmail("");
                  refresh();
                  toast.success("Admin added");
                } catch (e) {
                  toast.error((e as Error).message);
                }
              }}
            >
              Add
            </Button>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-border p-4">
          <h2 className="font-medium">
            Subscribers <span className="text-muted-foreground">({data?.subscriberCount ?? 0})</span>
          </h2>
          <div className="mt-3 max-h-96 overflow-y-auto text-sm">
            {subscribers.length === 0 && (
              <p className="text-muted-foreground">No subscribers yet.</p>
            )}
            {subscribers.map((s) => (
              <div key={s.id} className="flex justify-between border-b border-border py-1.5">
                <span>{s.email}</span>
                <span className="text-muted-foreground">
                  {s.status} · {s.source}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
