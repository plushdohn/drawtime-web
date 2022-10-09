<script lang="ts">
  import type { Player } from "$lib/logic/shared-types";
  import GameOverLeaderboard from "./GameOverLeaderboard.svelte";

  export let players: Player[];
</script>

<div class="p-16 bg-zinc-800 rounded flex flex-col items-center text-center">
  <span class="font-bold text-3xl leading-normal">Game over!</span>
  <GameOverLeaderboard {players} />
</div>
