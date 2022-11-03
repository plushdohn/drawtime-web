<script lang="ts">
  import EraserIcon from "$lib/components/icons/EraserIcon.svelte";

  export let selected: boolean;
  export let callback: () => void;
</script>

<button
  on:click={callback}
  class="text-zinc-500 hover:text-zinc-400"
  class:text-zinc-200={selected}
>
  <EraserIcon class="w-7 fill-current" />
</button>
