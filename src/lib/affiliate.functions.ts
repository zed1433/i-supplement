import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AffiliateIdStatus = {
  key: string;
  retailer: string;
  label: string;
  /** Masked so the value is never fully echoed back to the browser. */
  preview: string;
  demo: boolean;
};

function mask(value: string): string {
  if (value.length <= 4) return value;
  return `${value.slice(0, 3)}…${value.slice(-2)}`;
}

async function assertAdmin(context: any): Promise<void> {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden: admin role required");
}

/** Admin-only view of which retailer programmes still run on demo identifiers. */
export const getAffiliateIdStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any): Promise<AffiliateIdStatus[]> => {
    await assertAdmin(context);

    const { AFFILIATE_PROGRAMMES, affiliateId, isDemoIdentifier, loadAffiliateOverrides } =
      await import("@/lib/affiliateConfig");
    await loadAffiliateOverrides(true);
    return AFFILIATE_PROGRAMMES.map((programme) => ({
      key: programme.key,
      retailer: programme.retailer,
      label: programme.label,
      preview: mask(affiliateId(programme.key)),
      demo: isDemoIdentifier(programme.key),
    }));
  });

/** Admin-only save of a real retailer identifier. Empty value clears the override. */
export const saveAffiliateId = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ key: z.string().min(2).max(64), value: z.string().max(120) }).parse(data),
  )
  .handler(async ({ data, context }: any) => {
    await assertAdmin(context);

    const { AFFILIATE_PROGRAMMES, AFFILIATE_SETTING_PREFIX, loadAffiliateOverrides } = await import(
      "@/lib/affiliateConfig"
    );
    if (!AFFILIATE_PROGRAMMES.some((p) => p.key === data.key)) {
      throw new Error("Unknown affiliate programme");
    }
    const value = String(data.value ?? "").trim();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const settingKey = `${AFFILIATE_SETTING_PREFIX}${data.key}`;

    if (!value) {
      await supabaseAdmin.from("app_settings").delete().eq("key", settingKey);
    } else {
      const { error } = await supabaseAdmin
        .from("app_settings")
        .upsert({ key: settingKey, value, updated_at: new Date().toISOString() });
      if (error) throw error;
    }
    await loadAffiliateOverrides(true);
    return { ok: true };
  });
