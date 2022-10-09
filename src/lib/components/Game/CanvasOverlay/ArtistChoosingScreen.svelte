<script lang="ts">
  import { chooseWord } from "$lib/logic/client/live/game";
  import type { ExtendedSocket } from "$lib/logic/client/live/types";
  import { GamePhase } from "$lib/logic/shared-types";
  import GameTimer from "../GameTimer.svelte";

  export let choices: string[] | null;
  export let socket: ExtendedSocket;

  function handleChoice(choice: string) {
    chooseWord(socket, choice);
  }
</script>

<div class="p-16 bg-zinc-800 rounded flex flex-col text-center max-w-sm relative">
  <span class="text-3xl font-bold">Choose a word!</span>
  <span class="text-zinc-400 mt-4">
    If you don't choose, a word will be chosen randomly in 10 seconds.
  </span>

  {#if choices}
    <div class="flex flex-col mt-4">
      {#each choices as choice}
        <button
          on:click={() => handleChoice(choice)}
          class="bg-red-500 py-3 px-8 my-2 rounded-sm hover:bg-red-400 focus:bg-red-400 uppercase font-semibold text-2xl"
        >
          {choice}
        </button>
      {/each}
    </div>
  {/if}

  <GameTimer phase={GamePhase.Choosing} />
</div>
