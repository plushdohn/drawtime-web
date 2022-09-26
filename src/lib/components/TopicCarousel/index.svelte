<script lang="ts">
  import type { TopicModel } from "$lib/logic/shared";
  import TopicCarouselEntry from "./Entry.svelte";

  export let topics: TopicModel[];
  export let onTopicSelected: (topicId: string) => void;
</script>

<div class="flex flex-col mb-12">
  <div
    class="flex snap-x gap-6 items-center mt-1 overflow-x-auto overflow-y-visible py-4"
  >
    {#each topics as topic (topic.id)}
      <TopicCarouselEntry {topic} callback={onTopicSelected} />
    {/each}
  </div>
</div>
