<script lang="ts">
  import { searchTopics } from "$lib/logic/client/database";
  import type { TopicWithCreator } from "$lib/logic/shared-types";
  import debounce from "lodash/debounce";
  import TopicThumbnail from "../TopicThumbnail.svelte";

  let results: TopicWithCreator[] = [];
  let query = "";

  const search = debounce(async () => {
    if (query) {
      results = await searchTopics(query);

      console.log(results);
    } else {
      results = [];
    }
  }, 500);
</script>

<div class="relative">
  <input
    type="text"
    placeholder="Search topics..."
    class="lg:w-96 rounded-sm bg-zinc-700 p-2.5"
    bind:value={query}
    on:input={search}
  />

  {#if results}
    <ul class="w-full flex flex-col bg-zinc-700 absolute top-full left-0 rounded-sm mt-2">
      {#each results as result}
        <li>
          <a
            class="flex p-2.5 gap-2.5"
            href={`/topic/${result.id}`}
            on:click={() => (results = [])}
          >
            <TopicThumbnail topicId={result.id} class="w-32" />

            <div class="flex flex-col justify-center items-start">
              <span class="font-semibold">{result.name}</span>
              <span class="text-zinc-400">
                by <span class="font-semibold">{result.creator.username}</span>
              </span>
            </div>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>
