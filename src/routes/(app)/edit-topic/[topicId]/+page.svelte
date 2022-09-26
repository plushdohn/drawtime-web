<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import Spinner from "$lib/components/Spinner.svelte";
  import { authStore, userProfileStore } from "$lib/logic/client/auth";
  import Form from "$lib/components/TopicEditingForm/index.svelte";
  import { getTopicWithWords } from "$lib/logic/client/database";
  import { page } from "$app/stores";

  const topicId = $page.params.topicId;

  $: if (browser && $authStore === null) {
    goto("/login");
  }

  const getTopicToEdit = async () => {
    return await getTopicWithWords(topicId);
  };
</script>

<svelte:head>
  <title>Drawtime.io | Edit topic</title>
</svelte:head>

<div class="flex flex-col items-center p-8 lg:p-16 ">
  {#if $userProfileStore.pending}
    <Spinner class="w-7" />
  {:else if $authStore !== null && $userProfileStore.profile !== null}
    {#await getTopicToEdit()}
      <Spinner class="w-7" />
    {:then topic}
      <Form authToken={$authStore.accessToken} {topic} />
    {:catch err}
      <span class="font-bold text-4xl">Oh no!</span>
      <span class="text-zinc-400 mt-2">
        An error occurred while fetching topic details.
      </span>
    {/await}
  {/if}
</div>
