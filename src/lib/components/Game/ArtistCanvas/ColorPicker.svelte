<script lang="ts">
  import ColorPickerEntry from "./ColorPickerEntry.svelte";

  export let selectedColor: string;

  const COLORS = [
    "#ffffff",
    "#000000",
    "#ef4444",
    "#713f12",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#2563eb",
    "#6d28d9",
    "#d946ef",
    "#f9a8d4",
    "#fecdd3",
  ];
</script>

<div class="flex items-center relative">
  <div class="items-center hidden landscape:flex">
    {#each COLORS as color}
      <ColorPickerEntry
        selected={selectedColor === color}
        {color}
        on:click={() => (selectedColor = color)}
      />
    {/each}
  </div>

  <label class="w-7 h-7 rounded-full landscape:hidden" style={`background-color: ${selectedColor}`}>
    <input type="color" id="color-picker" class="hidden" bind:value={selectedColor} />
  </label>
</div>
