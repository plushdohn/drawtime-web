<script>
  import { goto } from "$app/navigation";
  import Spinner from "$lib/components/Spinner.svelte";
  import { signOut } from "$lib/logic/client/auth";
  import { onMount } from "svelte";

  onMount(async () => {
    await signOut();

    await goto("/");
  });
</script>

<div class="w-full h-screen bg-zinc-900 flex justify-center items-center">
  <div class="flex flex-col items-center bg-zinc-800 rounded-sm p-16 max-w-sm">
    <Spinner class="w-7" />
    <span class="text-zinc-400 mt-4">You are being logged out...</span>
  </div>
</div>
