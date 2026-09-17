import { createServerFn } from "@tanstack/react-start";
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

/** Admin-only view of which retailer programmes still run on demo identifiers. */
export const getAffiliateIdStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any): Promise<AffiliateIdStatus[]> => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error || !data) throw new Error("Forbidden: admin role required");

    const { AFFILIATE_PROGRAMMES, affiliateId, isDemoIdentifier } = await import(
      "@/lib/affiliateConfig"
    );
    return AFFILIATE_PROGRAMMES.map((programme) => ({
      key: programme.key,
      retailer: programme.retailer,
      label: programme.label,
      preview: mask(affiliateId(programme.key)),
      demo: isDemoIdentifier(programme.key),
    }));
  });
