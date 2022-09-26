<script lang="ts">
  import ColorEntry from "./ColorPickerEntry.svelte";

  const COLORS = [
    "#737373",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#14b8a6",
    "#0ea5e9",
    "#6366f1",
    "#a855f7",
    "#d946ef",
    "#fecdd3",
    "#78350f",
    "#000000",
  ];

  export let selectedColor: string;
  export let callback: (newColor: string) => void;
</script>

<div class="flex items-center">
  {#each COLORS as color}
    <ColorEntry
      {color}
      selected={selectedColor === color}
      on:click={() => callback(color)} />
  {/each}
</div>
