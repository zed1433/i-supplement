import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FlaskConical, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — i-Supplement Admin" },
      { name: "description", content: "Owner sign-in for the i-Supplement catalogue admin." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
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
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth`,
    });
    if (result.error) {
      setError(result.error.message);
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin" });
  }

  async function signInWithEmail(event: React.FormEvent) {
    event.preventDefault();
    setEmailBusy(true);
    setError(null);
    setNotice(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (!signInError) {
      navigate({ to: "/admin" });
      setEmailBusy(false);
      return;
    }
    if (signInError.message.toLowerCase().includes("invalid login credentials")) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (signUpError) setError(signUpError.message);
      else if (!data.session) setNotice("Check your email to confirm the account, then sign in.");
      else navigate({ to: "/admin" });
    } else {
      setError(signInError.message);
    }
    setEmailBusy(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 text-center">
        <span className="mx-auto flex size-10 items-center justify-center rounded-md bg-primary/15 text-primary">
          <FlaskConical className="size-5" />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold">i-Supplement Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with the site owner's account to manage the catalogue and affiliate links.
        </p>
        <Button onClick={signIn} disabled={busy} className="mt-6 w-full">
          <LogIn className="size-4" />
          {busy ? "Redirecting to Google…" : "Sign in with Google"}
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={signInWithEmail} className="space-y-2 text-left">
          <Input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" variant="outline" disabled={emailBusy} className="w-full">
            {emailBusy ? "Signing in…" : "Continue with email"}
          </Button>
        </form>

        {notice && <p className="mt-3 text-sm text-muted-foreground">{notice}</p>}
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Link to="/" className="mt-4 inline-block text-xs text-muted-foreground hover:text-foreground">
          Back to catalogue
        </Link>
      </div>
    </div>
  );
}

