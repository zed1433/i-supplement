import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FlaskConical, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SuppCheck Admin" },
      { name: "description", content: "Owner sign-in for the SuppCheck catalogue admin." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") navigate({ to: "/admin" });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  async function signIn() {
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth` },
    });
    if (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 text-center">
        <span className="mx-auto flex size-10 items-center justify-center rounded-md bg-primary/15 text-primary">
          <FlaskConical className="size-5" />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold">SuppCheck Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with the site owner's Google account to manage the catalogue and affiliate
          links.
        </p>
        <Button onClick={signIn} disabled={busy} className="mt-6 w-full">
          <LogIn className="size-4" />
          {busy ? "Redirecting to Google…" : "Sign in with Google"}
        </Button>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Link to="/" className="mt-4 inline-block text-xs text-muted-foreground hover:text-foreground">
          Back to catalogue
        </Link>
      </div>
    </div>
  );
}
