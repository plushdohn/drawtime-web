import { createClient } from "@supabase/supabase-js";
import { setupSupabaseHelpers } from "@supabase/auth-helpers-sveltekit";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";
import { dev } from "$app/environment";

export const supabaseClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
  autoRefreshToken: false,
});

setupSupabaseHelpers({
  supabaseClient,
  cookieOptions: {
    secure: !dev,
  },
});
