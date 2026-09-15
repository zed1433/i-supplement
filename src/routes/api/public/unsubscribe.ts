import { createFileRoute } from "@tanstack/react-router";

function page(message: string) {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>i-Supplement</title></head>
     <body style="font-family:Arial,sans-serif;background:#0b0f14;color:#e6edf3;display:flex;min-height:100vh;align-items:center;justify-content:center">
     <div style="text-align:center;max-width:420px;padding:24px">
       <h1 style="font-size:20px">i-Supplement</h1><p>${message}</p>
       <p><a href="/" style="color:#4ade80">Back to the catalogue</a></p>
     </div></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export const Route = createFileRoute("/api/public/unsubscribe")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = new URL(request.url).searchParams.get("token") ?? "";
        if (!/^[0-9a-f-]{36}$/i.test(token)) return page("This unsubscribe link is not valid.");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin
          .from("subscribers")
          .update({ status: "unsubscribed" })
          .eq("unsubscribe_token", token)
          .select("email")
          .maybeSingle();

        return page(
          data
            ? "You have been unsubscribed. You will not receive further offer emails."
            : "This unsubscribe link is not valid.",
        );
      },
    },
  },
});
