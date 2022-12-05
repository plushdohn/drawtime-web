<script lang="ts">
  import { startGame } from "$lib/logic/client/live/game";
  import type { ExtendedSocket } from "$lib/logic/client/live/types";

  export let socket: ExtendedSocket;
</script>

<div class="p-8 lg:p-16 bg-zinc-800 rounded flex flex-col items-center max-w-sm text-center">
  <span class="font-bold text-4xl mb-3">All ready!</span>
  <span class="text-zinc-400">You can now start the game or wait for more players to join.</span>
  <button
    on:click={() => startGame(socket)}
    class="bg-red-500 font-semibold mt-8 rounded-sm py-3 px-16 hover:bg-red-400 focus:bg-red-400"
  >
    Start game
  </button>
</div>
