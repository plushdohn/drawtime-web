<script lang="ts">
  import FillIcon from "$lib/components/icons/FillIcon.svelte";

  export let selected: boolean;
  export let callback: () => void;
</script>

<button
  on:click={callback}
  class="text-zinc-500 hover:text-zinc-400"
  class:text-zinc-200={selected}
>
  <FillIcon class="w-7 fill-current" />
</button>
