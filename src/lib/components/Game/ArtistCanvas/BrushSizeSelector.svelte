<script lang="ts">
  export let size = 1;
</script>

<div class="flex items-center gap-2">
  <span class="text-zinc-400 hidden sm:block">Size:</span>
  <input type="range" min="1" max="50" bind:value={size} class="cursor-pointer accent-red-500" />
</div>
