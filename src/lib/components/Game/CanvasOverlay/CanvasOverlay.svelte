<script lang="ts">
  import { dev } from "$app/environment";
  import type { ExtendedSocket } from "$lib/logic/client/live/types";
  import { type GameState, GamePhase } from "$lib/logic/shared-types";
  import ArtistChoosingScreen from "./ArtistChoosingScreen.svelte";
  import GameOverScreen from "./GameOverScreen/GameOverScreen.svelte";
  import HostWaitingScreen from "./HostWaitingScreen.svelte";
  import RoundOverScreen from "./RoundOverScreen/RoundOverScreen.svelte";
  import WaitingForArtistChoiceScreen from "./WaitingForArtistChoiceScreen.svelte";
  import WaitingForHostScreen from "./WaitingForHostScreen.svelte";
  import WaitingPlayersScreen from "./WaitingPlayersScreen.svelte";

  export let game: GameState;
  export let userId: string;
  export let socket: ExtendedSocket;
</script>

<div class="absolute w-full h-full bg-[#000000aa] flex flex-col justify-center items-center">
  {#if game.phase === GamePhase.Waiting}
    {#if game.players.length < (dev ? 2 : 2)}
      <WaitingPlayersScreen />
    {:else if game.owner === userId}
      <HostWaitingScreen {socket} />
    {:else}
      <WaitingForHostScreen {...game} />
    {/if}
  {:else if game.phase === GamePhase.Choosing}
    {#if game.artist === userId}
      <ArtistChoosingScreen choices={game.choices} {socket} />
    {:else}
      <WaitingForArtistChoiceScreen {...game} />
    {/if}
  {:else if game.phase === GamePhase.Transitioning && game.secret !== null}
    <RoundOverScreen {...game} secret={game.secret} />
  {:else if game.phase === GamePhase.Ended}
    <GameOverScreen players={game.players} />
  {/if}
</div>
