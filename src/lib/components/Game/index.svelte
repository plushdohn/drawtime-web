<script lang="ts">
  import Spinner from "$lib/components/Spinner.svelte";
  import { GamePhase, type GameState } from "$lib/logic/shared";
  import { onMount } from "svelte";
  import PlayerLeaderboard from "./PlayerLeaderboard.svelte";
  import RemoteCanvas from "./RemoteCanvas/RemoteCanvas.svelte";
  import Chat from "./Chat/Chat.svelte";
  import ArtistCanvas from "./ArtistCanvas/ArtistCanvas.svelte";
  import { joinGame, subscribeToGameUpdates } from "$lib/logic/client/live/game";

  export let socket: WebSocket;
  export let gameId: string;
  export let userId: string;

  let game: GameState | null = null;
  let error: string | null = null;

  onMount(async () => {
    let unsub: () => void;

    try {
      game = await joinGame(socket, gameId);

      unsub = subscribeToGameUpdates((updater) => {
        game = updater(game as GameState);
      });
    } catch (err: any) {
      error = (err as Error).message;
    }

    return () => {
      if (unsub) unsub();
    };
  });
</script>

{#if game !== null}
  <div class="flex h-full items-center p-16">
    <PlayerLeaderboard players={game.players} artistId={game.artist} />
    {#if userId === game.artist && game.phase === GamePhase.Drawing}
      <ArtistCanvas {game} {userId} {socket} />
    {:else}
      <RemoteCanvas {game} {userId} {socket} />
    {/if}
    <Chat
      {socket}
      phase={game.phase}
      artistId={game.artist}
      clue={game.clue}
      {userId}
      players={game.players}
    />
  </div>
{:else}
  <div class="p-16 flex flex-col justfy-center items-center bg-zinc-800 rounded-sm">
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