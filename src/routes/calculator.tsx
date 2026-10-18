import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/suppcheck/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { pushWorkspace, syncOnLoad } from "@/lib/calculator/workspace-sync";

export const Route = createFileRoute("/calculator")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Nutrition Calculator — Macros, Micronutrients & Absorption | i-Supplement" },
      {
        name: "description",
        content:
          "Build a meal from 4,000+ lab-measured foods (USDA, CIQUAL) and packaged foods, see calories, macros and micronutrients against official targets, plus modeled iron, B12 and zinc absorption.",
      },
      { property: "og:title", content: "Nutrition Calculator | i-Supplement" },
      {
        property: "og:description",
        content:
          "Calculate calories, macros and micronutrients from real foods, with evidence-bounded absorption estimates and supplement comparison links.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalculatorPage,
});

type SyncState = "checking" | "guest" | "synced" | "error";

function CalculatorPage() {
  const [state, setState] = useState<SyncState>("checking");
  const [userId, setUserId] = useState<string | null>(null);
  const [frameKey, setFrameKey] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    const start = async (uid: string | null) => {
      setUserId(uid);
      if (!uid) return setState("guest");
      try {
        await syncOnLoad(uid);
        if (!active) return;
        setState("synced");
        setFrameKey((k) => k + 1); // reload the calculator with the newest copy
      } catch {
        if (active) setState("error");
      }
    };
    supabase.auth.getSession().then(({ data }) => start(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") start(session?.user.id ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== "bio-calculator:saved") return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        pushWorkspace(userId).then(
          () => setState("synced"),
          () => setState("error"),
        );
      }, 1500);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [userId]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
        {state === "guest" && (
          <>
            <span>Your meals are saved in this browser only.</span>
            <Link
              to="/auth"
              onClick={() => sessionStorage.setItem("postAuthRedirect", "/calculator")}
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Sign in to save across devices
            </Link>
          </>
        )}
        {state === "synced" && <span>Saved to your account — available on any device you sign in on.</span>}
        {state === "error" && <span>Couldn't reach your account; saving in this browser for now.</span>}
        {state === "checking" && <span>Checking your saved calculator…</span>}
      </div>
      {state !== "checking" && (
        <iframe
          key={frameKey}
          src="/bio-calculator/index.html"
          title="Bio Calculator"
          className="block h-[calc(100vh-6.5rem)] w-full border-0"
        />
      )}
      <p className="px-4 py-3 text-xs text-muted-foreground">
        Food data: USDA FoodData Central (public domain) · ANSES-CIQUAL 2020 French food composition
        table (Etalab Open Licence) · Open Food Facts packaged-food label data (ODbL).
      </p>
    </div>
  );
}
