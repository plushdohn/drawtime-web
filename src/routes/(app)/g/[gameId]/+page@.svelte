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
    <Game {gameId} socket={$gameServerConnectionStore.socket} userId={user.id} />
  {:else}
    <div
      class="p-16 flex flex-col justfy-center items-center bg-zinc-800 rounded-sm max-w-xs text-center w-full"
    >
      {#if $gameServerConnectionStore.error !== null}
        <span class="text-4xl text-white font-bold">Oh no!</span>
        <span class="text-zinc-400 mt-2">Lost connection to game servers.</span>
        <button
          on:click={reconnect}
          class="w-full bg-red-500 font-semibold rounded-sm py-2 mt-8 hover:bg-red-400 focus:bg-red-400"
        >
          Reconnect
        </button>
      {:else}
        <Spinner class="w-8" />
        <span class="text-zinc-400 mt-4">Connecting to server...</span>
      {/if}
    </div>
  {/if}
</div>
