<script lang="ts">
  import BrushIcon from "$lib/components/icons/BrushIcon.svelte";

  export let value = 1;
</script>

<div class="flex items-center gap-3">
  <BrushIcon class="w-7 fill-zinc-300" />
  <input type="range" min="1" max="10" bind:value class="cursor-pointer" />
</div>
