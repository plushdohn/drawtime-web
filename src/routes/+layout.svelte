<script lang="ts">
  import "../global.css";
  import "$lib/logic/client/supabase";
  import { startSupabaseSessionSync } from "@supabase/auth-helpers-sveltekit";
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";

  // this sets up automatic token refreshing
  startSupabaseSessionSync({
    page,
    handleRefresh: () => invalidateAll(),
  });
</script>

<slot />
