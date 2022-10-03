<script lang="ts">
  import TopicThumbnail from "$lib/components/TopicThumbnail.svelte";
  import type { TopicModel, TopicWithCreator } from "$lib/logic/shared";
  import { slide } from "svelte/transition";

  export let topic: TopicWithCreator;
  export let callback: (topicId: string) => void;

  let hovered = false;

  function handleHover() {
    hovered = true;
  }

  function handleLeave() {
    hovered = false;
  }
</script>

<button
  on:click={() => callback(topic.id)}
  on:mouseenter={handleHover}
  on:focus={handleHover}
  on:blur={handleLeave}
  on:mouseleave={handleLeave}
  class="flex-shrink-0 snap-start relative rounded-sm flex flex-col rounded-sm overflow-hidden cursor-pointer"
>
  <TopicThumbnail topicId={topic.id} class="w-64 aspect-video object-cover" />
  <div
    class="absolute inset-0 flex flex-col-reverse bg-gradient-to-t from-[#000000cc] via-[#00000099] p-4 text-left"
  >
    {#if hovered}
      <span class="text-zinc-300 text-sm" transition:slide|local={{ duration: 200 }}>
        by <span class="font-semibold">{topic.creator.username}</span>
        <br />
        {topic.plays} plays
      </span>
    {/if}
    <span class="text-white font-bold font-fancy text-lg truncate">
      {topic.name}
    </span>
  </div>
</button>
