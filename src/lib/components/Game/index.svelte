<script lang="ts">
  import Spinner from "$lib/components/Spinner.svelte";
  import { GamePhase, type GameState } from "$lib/logic/shared-types";
  import { onMount } from "svelte";
  import PlayerLeaderboard from "./PlayerLeaderboard.svelte";
  import RemoteCanvas from "./RemoteCanvas/RemoteCanvas.svelte";
  import Chat from "./Chat/Chat.svelte";
  import ArtistCanvas from "./ArtistCanvas/ArtistCanvas.svelte";
  import { joinGame, subscribeToGameUpdates } from "$lib/logic/client/live/game";
  import AudioManager from "./AudioManager.svelte";
  import type { ExtendedSocket } from "$lib/logic/client/live/types";
  import ReconnectionBox from "./ReconnectionBox.svelte";

  export let socket: ExtendedSocket;
  export let socketError: string | null;
  export let gameId: string;

  let game: GameState | null = null;
  let error: string | null = null;

  onMount(async () => {
    let unsub: () => void;

    try {
      game = await joinGame(socket, gameId);

      unsub = subscribeToGameUpdates(socket, (updater) => {
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
    {#if socket.auth.id === game.artist && game.phase === GamePhase.Drawing}
      <ArtistCanvas {game} userId={socket.auth.id} {socket} />
    {:else}
      <RemoteCanvas {game} userId={socket.auth.id} {socket} />
    {/if}
    <Chat
      {socket}
      phase={game.phase}
      artistId={game.artist}
      clue={game.clue}
      userId={socket.auth.id}
      players={game.players}
    />

    <AudioManager {socket} />

    {#if socketError !== null}
      <ReconnectionBox />
    {/if}
  </div>
{:else}
  <div class="p-16 flex flex-col justfy-center items-center bg-zinc-800 rounded-sm">
    {#if error}
      <span class="text-4xl text-white font-bold">Oh no!</span>
      <span class="text-zinc-400 mt-2.5">Couldn't join game, it likely doesn't exist.</span>

      <a
        href="/"
        class="text-center mt-6 bg-zinc-700 hover:bg-zinc-600 py-2.5 w-full font-semibold rounded-sm"
      >
        Go to home page
      </a>
    {:else}
      <Spinner class="w-8" />
      <span class="text-zinc-400 mt-4">Joining game...</span>
    {/if}
  </div>
{/if}
