<script lang="ts">
  export let selectedColor: string;
</script>

<div class="flex items-center gap-2">
  <span class="text-zinc-400">Color:</span>
  <input type="color" bind:value={selectedColor} class=" rounded-sm" />
</div>
