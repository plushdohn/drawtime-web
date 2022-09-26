<script lang="ts">
  import Spinner from "$lib/components/Spinner.svelte";

  export let error: string | null;
  export let onClose: () => void;
  export let onRetry: () => void;
</script>

<div
  class="fixed z-10 inset-0 w-full h-full flex justify-center items-center bg-[#000000aa]"
>
  <div
    class="p-16 rounded-sm bg-zinc-900 flex flex-col items-center max-w-xs w-full"
  >
    {#if error === null}
      <Spinner class="w-7" />
      <span class="font-semibold text-zinc-400 mt-4">Creating topic...</span>
    {:else}
      <span class="font-bold text-4xl">Oh no!</span>
      <span class="text-zinc-400">An error occurred.</span>
      <button
        type="button"
        on:click={onRetry}
        class="w-full rounded-sm font-semibold py-3 mt-10 bg-red-500 hover:bg-red-400"
      >
        Retry
      </button>
      <button
        type="button"
        on:click={onClose}
        class="w-full rounded-sm font-semibold py-3 mt-4 bg-zinc-500 hover:bg-zinc-400"
      >
        Cancel
      </button>
    {/if}
  </div>
</div>
