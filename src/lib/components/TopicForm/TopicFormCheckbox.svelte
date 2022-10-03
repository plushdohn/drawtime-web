<script lang="ts">
  export let label: string;
  export let description: string | null = null;
  export let name: string;
  export let checked: boolean;
</script>

<label for={name} class="font-semibold mt-6">
  {label}
</label>
{#if description !== null}
  <span class="text-zinc-400 mb-1">
    {description}
  </span>
{/if}
<input
  name="unlisted"
  type="checkbox"
  class="self-start w-8 h-8 accent-red-500 cursor-pointer"
  bind:checked
/>
