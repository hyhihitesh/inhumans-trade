import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAdminEnv } from "@/lib/supabase/env";

export function createAdminClient() {
  const { url, serviceRoleKey } = requireSupabaseAdminEnv();

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
