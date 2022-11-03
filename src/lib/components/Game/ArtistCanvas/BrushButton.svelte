<script lang="ts">
  import BrushIcon from "$lib/components/icons/BrushIcon.svelte";

  export let selected: boolean;
  export let callback: () => void;
</script>

<button
  on:click={callback}
  class="text-zinc-500 hover:text-zinc-400"
  class:text-zinc-200={selected}
>
  <BrushIcon class="w-7 fill-current" />
</button>
