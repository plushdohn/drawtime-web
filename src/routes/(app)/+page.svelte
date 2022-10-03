<script lang="ts">
  import TopicCarousel from "$lib/components/TopicCarousel/index.svelte";
  import type { PageData } from "./$types";
  import GameCreationModal from "$lib/components/GameCreationModal.svelte";
  import { goto } from "$app/navigation";

  export let data: PageData;

  $: accessToken = data.session.accessToken as string;

  let topicId: string | null = null;

  async function handleTopicSelection(id: string) {
    if (data.session.user) {
      topicId = id;
    } else {
      await goto("/login");
    }
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
    <GameCreationModal {topicId} onCancel={handleModalClosure} {accessToken} />
  {/if}
</div>
