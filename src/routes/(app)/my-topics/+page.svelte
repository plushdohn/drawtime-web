<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";

  import Spinner from "$lib/components/Spinner.svelte";
  import { authStore } from "$lib/logic/client/auth";
  import { supabaseClient } from "$lib/logic/client/supabase";
  import type { TopicModel } from "$lib/logic/shared";
  import MyTopicsList from "$lib/components/MyTopicsList/index.svelte";

  async function loadOwnTopics() {
    if ($authStore === null)
      throw new Error("Tried to get own topics without being authed!");

    const userId = $authStore.user.id;
    const { error, data } = await supabaseClient
      .from<TopicModel>("topics")
      .select("id, name, unlisted")
      .eq("creator", userId);

    if (error) throw error;

    return data;
  }

  $: if (browser && $authStore === null) {
    goto("/login");
  }
</script>

<svelte:head>
  <title>Drawtime.io | My topics</title>
</svelte:head>

<div class="w-full p-8 lg:p-16 flex flex-col">
  <span class="font-bold text-4xl mb-6">My topics</span>

  {#if $authStore !== null}
    {#await loadOwnTopics()}
      <Spinner class="w-7" />
    {:then topics}
      <MyTopicsList {topics} />
    {:catch}
      <span class="text-zinc-400">
        Something went wrong, couldn't get own topics :(
      </span>
    {/await}
  {/if}
</div>
