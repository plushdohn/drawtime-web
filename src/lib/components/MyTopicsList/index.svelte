<script lang="ts">
  import Entry from "./Entry.svelte";

  export let topics: { id: string; name: string; unlisted: boolean }[];

  const handleTopicDeletion = (topicId: string) => {
    topics = topics.filter(({ id }) => id !== topicId);
  };
</script>

<div class="flex flex-col max-w-2xl">
  {#each topics as topic (topic.id)}
    <Entry {topic} deletionCallback={handleTopicDeletion} />
  {/each}
</div>
