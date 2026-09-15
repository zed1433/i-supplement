import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/cron/feeds")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;

        const { acquireJobLease, releaseJobLease } = await import("@/lib/jobs.server");
        const lease = await acquireJobLease("feed_sync", 20);
        if (!lease.ok) return Response.json({ skipped: lease.reason });

        try {
          const { runAllFeeds } = await import("@/lib/feeds.server");
          const summary = await runAllFeeds("cron");
          const failed = summary.filter((s) => !s.ok).length;
          await releaseJobLease(
            "feed_sync",
            `${summary.length - failed}/${summary.length} feeds updated`,
            failed > 0 && failed === summary.length && summary.length > 0,
          );
          return Response.json({ summary });
        } catch (err) {
          await releaseJobLease("feed_sync", (err as Error).message, true);
          return Response.json({ error: (err as Error).message }, { status: 500 });
        }
      },
    },
  },
});
