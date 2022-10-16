<script lang="ts">
  import { page } from "$app/stores";
  import Spinner from "$lib/components/Spinner.svelte";
  import { connectToGameServer, gameServerConnectionStore } from "$lib/logic/client/live/socket";
  import { onMount } from "svelte";
  import Game from "$lib/components/Game/index.svelte";
  import type { PageData } from "./$types";

  const gameId = $page.params.gameId;

  export let data: PageData;

  $: user = data.session.user!;

  onMount(async () => {
    if ($gameServerConnectionStore.socket === null) {
      connectToGameServer(data.session.accessToken as string);
    }
  });

  const reconnect = () => {
    connectToGameServer(data.session.accessToken as string);
  };
</script>

<svelte:head>
  <title>Drawtime.io | Game</title>
</svelte:head>

<div class="w-full h-screen bg-zinc-900 flex justify-center items-center">
  {#if $gameServerConnectionStore.socket !== null}
    <Game
      {gameId}
      socket={$gameServerConnectionStore.socket}
      userId={user.id}
      socketError={$gameServerConnectionStore.error}
    />
  {:else}
    <div
      class="p-16 flex flex-col justfy-center items-center bg-zinc-800 rounded-sm max-w-xs text-center w-full"
    >
      {#if $gameServerConnectionStore.error !== null}
        {#if $gameServerConnectionStore.pending}
          <Spinner class="w-7" />
          <span class="text-zinc-400 mt-4">
            Lost connection to game servers, trying to reconnect...
          </span>
        {:else}
          <span class="font-bold text-4xl">Oh no!</span>
          <span class="text-zinc-400 mt-2">Connection timed out.</span>

          <button
            on:click={reconnect}
            class="bg-red-500 font-semibold hover:bg-red-400 py-2.5 rounded-sm w-full mt-4"
          >
            Reconnect manually
          </button>
        {/if}
      {:else}
        <Spinner class="w-7" />
        <span class="text-zinc-400 mt-4">Connecting to server...</span>
      {/if}
    </div>
  {/if}
</div>
