<script lang="ts">
  export let value = "";
  export let error: string | undefined = undefined;

  export let validate: (e: Event) => void;
</script>

<label for="name" class="font-semibold mt-8 mb-1">Name</label>
<input
  autocomplete="off"
  name="name"
  type="text"
  placeholder={`"Common fruits"; "Characters in a TV series"...`}
  class="p-3 rounded-sm bg-zinc-800 text-white border-red-500"
  class:border-2={error !== undefined}
  bind:value
  on:input={validate}
/>
{#if error}
  <span class="text-zinc-400 text-sm text-red-500 mt-2">
    {error}
  </span>
{/if}
