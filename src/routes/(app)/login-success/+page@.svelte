<script>
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Spinner from "$lib/components/Spinner.svelte";
  import { authStore } from "$lib/logic/client/auth";

  $: if (browser && $authStore !== null) {
    const next = $page.url.searchParams.get("next");

    setTimeout(() => {
      if (next) {
        goto(next);
      } else {
        goto("/");
      }
    }, 2000);
  }
</script>

<div class="w-full h-screen bg-zinc-900 flex justify-center items-center">
  <div class="flex flex-col items-center bg-zinc-800 rounded-sm p-16 max-w-sm">
    <Spinner class="w-7" />
    <span class="text-center text-zinc-400 mt-4">
      Login successfull, you are being redirected...
    </span>
  </div>
</div>
