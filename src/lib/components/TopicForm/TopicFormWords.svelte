<script lang="ts">
  import AddIcon from "../icons/AddIcon.svelte";
  import RemoveIcon from "../icons/RemoveIcon.svelte";

  export let validate: (e: Event | string) => void;
  export let words: string[];
  export let errors: {
    [key: string]: string | undefined;
  };
  export let batchInputValue = "";

  function onAddWordClick() {
    words = [...words, ""];

    validate("words");
  }

  function onRemoveWordClick(i: number) {
    return function () {
      words = words.filter((_, index: number) => index !== i);

      validate("words");
    };
  }

  function onBatchAddWords() {
    if (!batchInputValue) return;

    const batchWords = batchInputValue.split(",").map((w) => w.trim());

    words = [
      ...words,
      ...batchWords.filter((w) => batchWords.indexOf(w) === batchWords.lastIndexOf(w)),
    ];

    batchInputValue = "";

    validate("words");
  }
</script>

<span class="font-semibold mt-6">Words</span>
<span class="text-zinc-400">There are currently {words.length} word(s).</span>
<div
  class="mt-1 flex flex-col bg-zinc-800 rounded-sm p-2.5 border-red-500"
  class:border-2={errors.words !== undefined ||
    Object.keys(errors).filter((k) => k.startsWith("words")).length > 0}
>
  {#each words as _, i}
    <div class="flex flex-col mb-3">
      <div class="flex">
        <input
          type="text"
          name={`words[${i}]`}
          class="w-full p-2.5 rounded-sm bg-zinc-700 text-white border-red-500"
          class:border-2={errors[`words[${i}]`]}
          placeholder="Something..."
          bind:value={words[i]}
          on:input={validate}
        />
        <button
          type="button"
          on:click={onRemoveWordClick(i)}
          class="bg-yellow-500 hover:bg-yellow-400 focus:bg-yellow-400 text-white w-24 ml-2 rounded-sm flex justify-center items-center"
        >
          <RemoveIcon class="w-6 fill-white" />
        </button>
      </div>
      {#if errors[`words[${i}]`]}
        <span class="text-zinc-400 text-sm text-red-500 mt-1">
          {errors[`words[${i}]`]}
        </span>
      {/if}
    </div>
  {/each}
  <button
    type="button"
    on:click={onAddWordClick}
    class="w-full font-bold py-2 text-white bg-red-500 hover:bg-red-400 focus:bg-red-400 rounded-sm flex items-center justify-center"
  >
    <AddIcon class="w-7 fill-white" />
  </button>
</div>

{#if errors.words}
  <span class="text-zinc-400 text-sm text-red-500 mt-2">
    {errors.words}
  </span>
{/if}

<span class="text-zinc-300 mb-1 mt-4">
  You can also add words in bulk as a comma-separated list
</span>
<div class="flex">
  <input
    type="text"
    placeholder="Banana, Apple, Mango..."
    class="p-2.5 rounded-sm bg-zinc-800 w-full"
    bind:value={batchInputValue}
  />
  <button
    type="button"
    on:click={onBatchAddWords}
    class="ml-2 bg-yellow-500 hover:bg-yellow-400 focus:bg-yellow-400 text-white w-24 rounded-sm flex justify-center items-center"
  >
    <AddIcon class="w-6 fill-white" />
  </button>
</div>
