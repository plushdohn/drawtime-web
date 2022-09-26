<script>
  import { signInWithGoogle } from "$lib/logic/client/auth";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  function handleGoogleLogin() {
    const next = $page.url.searchParams.get("next");
    signInWithGoogle(next ? decodeURI(next) : undefined);
  }
</script>

<div class="w-full h-screen bg-zinc-900 flex justify-center items-center">
  <div class="flex flex-col items-center bg-zinc-800 rounded-sm p-16 max-w-sm">
    <span class="font-bold text-4xl">WELCOME!</span>
    <span class="text-center text-zinc-400 mt-2">
      An account will allow you to create new topics to share with the world.
    </span>
    <hr class="border-zinc-500 mt-4 mb-8 w-full" />
    <button
      on:click={handleGoogleLogin}
      class="bg-red-500 hover:bg-red-400 w-full py-2.5 rounded-sm font-semibold"
    >
      Login with Google
    </button>
  </div>
</div>
