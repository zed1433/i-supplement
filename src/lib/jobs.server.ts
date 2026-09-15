// Single-flight lock + pause state for scheduled jobs. Server-only.
export type JobName = "feed_sync" | "inbox_scan";

export async function acquireJobLease(job: JobName, minutes = 10) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: state } = await supabaseAdmin
    .from("job_state")
    .select("job_name, paused, pause_reason, leased_until")
    .eq("job_name", job)
    .maybeSingle();

  if (!state) {
    await supabaseAdmin.from("job_state").insert({ job_name: job });
  } else {
    if (state.paused) return { ok: false as const, reason: `paused: ${state.pause_reason}` };
    if (state.leased_until && new Date(state.leased_until) > new Date()) {
      return { ok: false as const, reason: "another run is already in progress" };
    }
  }

  const leasedUntil = new Date(Date.now() + minutes * 60_000).toISOString();
  const { error } = await supabaseAdmin
    .from("job_state")
    .update({ leased_until: leasedUntil, updated_at: new Date().toISOString() })
    .eq("job_name", job);
  if (error) return { ok: false as const, reason: error.message };
  return { ok: true as const };
}

export async function releaseJobLease(job: JobName, status: string, failed = false) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: state } = await supabaseAdmin
    .from("job_state")
    .select("failures")
    .eq("job_name", job)
    .maybeSingle();
  const failures = failed ? (state?.failures ?? 0) + 1 : 0;
  await supabaseAdmin
    .from("job_state")
    .update({
      leased_until: null,
      last_run_at: new Date().toISOString(),
      last_status: status.slice(0, 500),
      failures,
      paused: failures >= 5,
      pause_reason: failures >= 5 ? "paused automatically after 5 consecutive failures" : "",
      updated_at: new Date().toISOString(),
    })
    .eq("job_name", job);
}
