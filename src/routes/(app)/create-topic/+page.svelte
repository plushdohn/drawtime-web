<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import Spinner from "$lib/components/Spinner.svelte";
  import { authStore, userProfileStore } from "$lib/logic/client/auth";
  import Form from "$lib/components/TopicCreationForm/index.svelte";

  $: if (browser && $authStore === null) {
    goto("/login");
  }
</script>

<svelte:head>
  <title>Drawtime.io | Create a topic</title>
</svelte:head>

<div class="flex flex-col items-center p-8 lg:p-16 ">
  {#if $userProfileStore.pending}
    <Spinner class="w-7" />
  {:else if $authStore !== null && $userProfileStore.profile !== null}
    <Form authToken={$authStore.accessToken} />
  {/if}
</div>
