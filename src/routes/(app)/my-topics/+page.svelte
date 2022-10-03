<script lang="ts">
  import MyTopicsList from "$lib/components/MyTopicsList/index.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>Drawtime.io | My topics</title>
</svelte:head>

<div class="w-full p-8 lg:p-16 flex flex-col">
  <span class="font-bold text-4xl mb-6">My topics</span>

  <MyTopicsList topics={data.topics} />
</div>
