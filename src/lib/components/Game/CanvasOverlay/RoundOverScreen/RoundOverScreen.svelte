<script lang="ts">
  import { GamePhase, type Player } from "$lib/logic/shared";
  import GameTimer from "../../GameTimer.svelte";
  import RoundEndLeaderboard from "./RoundEndLeaderboard.svelte";

  export let secret: string;
  export let players: Player[];
  export let artist: string;
</script>

<div class="relative p-16 bg-zinc-800 rounded flex flex-col items-center text-center max-w-sm">
  <span class="font-bold text-4xl mb-4">Round over!</span>
  <span class="text-zinc-400">
    The word was
    <br />
    <span class="text-yellow-500 text-xl uppercase font-bold">
      {secret}
    </span>
  </span>
  <hr class="w-full border-zinc-600 my-4" />
  <RoundEndLeaderboard {players} {artist} />

  <GameTimer phase={GamePhase.Transitioning} />
</div>
