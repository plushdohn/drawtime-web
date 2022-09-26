<script lang="ts">
  import Spinner from "$lib/components/Spinner.svelte";
  import { GamePhase, type GameState } from "$lib/logic/shared";
  import {
    joinGame,
    subscribeStoreToGameUpdates,
  } from "$lib/logic/client/game";
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import PlayerLeaderboard from "./PlayerLeaderboard.svelte";
  import RemoteCanvas from "./RemoteCanvas/RemoteCanvas.svelte";
  import Chat from "./Chat/Chat.svelte";
  import ArtistCanvas from "./ArtistCanvas/ArtistCanvas.svelte";

  export let socket: WebSocket;
  export let gameId: string;
  export let userId: string;

  const gameStore = writable<GameState | null>(null);

  let error: string | null = null;

  onMount(async () => {
    let unsub: () => void;

    try {
      const initialState = await joinGame(socket, gameId);

      gameStore.set(initialState);

      unsub = subscribeStoreToGameUpdates(gameStore as Writable<GameState>);
    } catch (err: any) {
      error = (err as Error).message;
    }

    return () => {
      if (unsub) unsub();
    };
  });
</script>

{#if $gameStore !== null}
  <div class="flex h-full items-center p-16">
    <PlayerLeaderboard
      players={$gameStore.players}
      artistId={$gameStore.artist}
    />
    {#if userId === $gameStore.artist && $gameStore.phase === GamePhase.Drawing}
      <ArtistCanvas game={$gameStore} {userId} {socket} />
    {:else}
      <RemoteCanvas game={$gameStore} {userId} {socket} />
    {/if}
    <Chat
      {socket}
      phase={$gameStore.phase}
      artistId={$gameStore.artist}
      clue={$gameStore.clue}
      {userId}
      players={$gameStore.players}
    />
  </div>
{:else}
  <div
    class="p-16 flex flex-col justfy-center items-center bg-zinc-800 rounded-sm"
  >
    {#if error}
      <span class="text-4xl text-zinc-400 font-bold">:(</span>
      <span class="text-zinc-400 font-semibold mt-4">
        Couldn't join game: {error}
      </span>
    {:else}
      <Spinner class="w-8" />
      <span class="text-zinc-400 font-semibold mt-4">Joining game...</span>
    {/if}
  </div>
{/if}
