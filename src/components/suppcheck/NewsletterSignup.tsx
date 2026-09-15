import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { subscribeEmail } from "@/lib/automation.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSignup() {
  const subscribe = useServerFn(subscribeEmail);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) return;
    setBusy(true);
    try {
      const res: any = await subscribe({ data: { email } });
      toast.success(
        res.alreadySubscribed ? "You are already on the list." : "You're in — offers on the way.",
      );
      setEmail("");
    } catch {
      toast.error("Could not sign you up. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <Mail className="mt-1 size-5 text-primary" />
        <div className="flex-1">
          <h2 className="font-display text-lg font-semibold">Get retailer deals by email</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Discount codes and price drops from the shops we compare. One short email per offer,
            unsubscribe any time.
          </p>
          <form onSubmit={submit} className="mt-4 flex max-w-md gap-2">
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" disabled={busy}>
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
