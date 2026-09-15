import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/cron/inbox")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;

        const { gmailConfigured } = await import("@/lib/gmail.server");
        if (!gmailConfigured()) return Response.json({ skipped: "gmail not connected" });

        const { acquireJobLease, releaseJobLease } = await import("@/lib/jobs.server");
        const lease = await acquireJobLease("inbox_scan", 15);
        if (!lease.ok) return Response.json({ skipped: lease.reason });

        try {
          const { scanInboxForOffers } = await import("@/lib/newsletter.server");
          const result = await scanInboxForOffers(10);
          await releaseJobLease("inbox_scan", `${result.created} new drafts`);
          return Response.json(result);
        } catch (err) {
          await releaseJobLease("inbox_scan", (err as Error).message, true);
          return Response.json({ error: (err as Error).message }, { status: 500 });
        }
      },
    },
  },
});
