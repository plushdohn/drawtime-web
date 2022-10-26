<script lang="ts">
  import TopicCarousel from "$lib/components/TopicCarousel/index.svelte";
  import type { PageData } from "./$types";
  import StartGameModal from "$lib/components/StartGameModal/index.svelte";

  export let data: PageData;

  const auth = data.session.user
    ? { userId: data.session.user.id, accessToken: data.session.accessToken }
    : null;

  let topicId: string | null = null;

  async function handleTopicSelection(id: string) {
    topicId = id;
  }

  function handleModalClosure() {
    topicId = null;
  }
</script>

<svelte:head>
  <title>Drawtime.io | Home</title>
</svelte:head>

<div class="w-full p-8 lg:p-16">
  <span class="font-bold text-3xl">GENERAL</span>
  <TopicCarousel topics={data.generalTopics} onTopicSelected={handleTopicSelection} />

  <span class="font-bold text-3xl">TRENDING</span>
  <TopicCarousel topics={data.trendingTopics} onTopicSelected={handleTopicSelection} />

  <span class="font-bold text-3xl">NEW</span>
  <TopicCarousel topics={data.newTopics} onTopicSelected={handleTopicSelection} />

  {#if topicId !== null}
    <StartGameModal {topicId} onCancel={handleModalClosure} {auth} />
  {/if}
</div>
