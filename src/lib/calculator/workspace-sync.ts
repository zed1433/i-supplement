import { supabase } from "@/integrations/supabase/client";

// Same key the embedded calculator's repository uses (public/bio-calculator/application/repository.js).
export const WORKSPACE_KEY = "bio-calculator.workspace.v1";
const STAMP = `${WORKSPACE_KEY}.updatedAt`;

/** Newer copy wins: returns which side should be kept. Missing timestamps count as oldest. */
export function pickNewer(localAt: string | null, remoteAt: string | null): "local" | "remote" | "none" {
  if (!localAt && !remoteAt) return "none";
  if (!remoteAt) return "local";
  if (!localAt) return "remote";
  return Date.parse(remoteAt) > Date.parse(localAt) ? "remote" : "local";
}

/** On sign-in: bring the account copy into the browser, or push the browser copy up, whichever is newer. */
export async function syncOnLoad(userId: string) {
  const { data, error } = await supabase
    .from("calculator_workspaces")
    .select("data, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  const localRaw = localStorage.getItem(WORKSPACE_KEY);
  const side = pickNewer(localRaw ? localStorage.getItem(STAMP) ?? "1970-01-01T00:00:00Z" : null, data?.updated_at ?? null);
  if (side === "remote" && data) {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(data.data));
    localStorage.setItem(STAMP, data.updated_at);
  } else if (side === "local") {
    await pushWorkspace(userId);
  }
}

export async function pushWorkspace(userId: string) {
  const raw = localStorage.getItem(WORKSPACE_KEY);
  if (!raw) return;
  const updated_at = localStorage.getItem(STAMP) ?? new Date().toISOString();
  const { error } = await supabase
    .from("calculator_workspaces")
    .upsert({ user_id: userId, data: JSON.parse(raw), updated_at });
  if (error) throw error;
}
