<script lang="ts">
  import { goto } from "$app/navigation";
  import { createGame } from "$lib/logic/client/live/game";
  import { connectToGameServer } from "$lib/logic/client/live/socket";
  import { gameCreationSchema } from "$lib/logic/shared-types";
  import CloseIcon from "../icons/CloseIcon.svelte";
  import Spinner from "../Spinner.svelte";

  export let topicId: string;
  export let onCancel: () => void;
  export let authInfo:
    | {
        userId: string;
        accessToken: string;
      }
    | {
        guestUsername: string;
      };

  let drawingTime = 60;
  let rounds = 3;

  let pending = false;
  let connectionError: string | null = null;
  let creationError: string | null = null;

  async function handleSubmit() {
    pending = true;

    connectionError = null;
    try {
      const socket = await connectToGameServer(
        "guestUsername" in authInfo
          ? { guestUsername: authInfo.guestUsername }
          : { authToken: authInfo.accessToken, userId: authInfo.userId }
      );

      creationError = null;
      try {
        const gameId = await createGame(socket, {
          topicId,
          drawingTime,
          rounds,
        });

        await goto(`/g/${gameId}`);
      } catch (err) {
        creationError = (err as Error).message;
      } finally {
        pending = false;
      }
    } catch (err) {
      connectionError = (err as Error).message;
      pending = false;
    }
  }
</script>

{#if pending}
  <div class="p-8 sm:p-16 flex flex-col items-center bg-zinc-900 rounded-sm max-w-xs w-full">
    <Spinner class="w-8 mb-4 self-center" />
    <span class="text-zinc-400 text-center self-center">Creating game...</span>
  </div>
{:else if connectionError !== null || creationError !== null}
  <div class="p-8 sm:p-16 flex flex-col items-center bg-zinc-900 rounded-sm max-w-sm w-full">
    <span class="text-3xl font-bold text-white">Oh no!</span>

    <span class="text-zinc-400 text-center mt-1.5">
      {#if connectionError !== null}
        Couldn't reach game servers.
      {:else if creationError !== null}
        Couldn't create game.
      {/if}
    </span>

    <button
      type="button"
      on:click={handleSubmit}
      class="text-white bg-red-500 hover:bg-red-400 font-semibold rounded-sm mt-8 py-3 w-full"
    >
      Retry
    </button>
    <button
      type="button"
      on:click={onCancel}
      class="text-white bg-zinc-700 hover:bg-zinc-600 font-semibold rounded-sm mt-3 py-3 w-full"
    >
      Cancel
    </button>
  </div>
{:else}
  <form class="p-8 sm:p-16 flex flex-col bg-zinc-900 rounded-sm max-w-lg w-full">
    <span class="font-bold text-4xl text-white">Create game</span>
    <span class="text-zinc-400 mt-2 mb-4">Set the game's parameters</span>

    <label for="drawingTime" class="font-semibold mt-3 text-white">Drawing time</label>
    <div class="flex bg-zinc-800 rounded-sm p-3 mt-1">
      <span class="font-semibold mr-3 text-white">{drawingTime}</span>
      <input
        id="drawingTime"
        class="w-full accent-red-500"
        type="range"
        min={gameCreationSchema.shape.drawingTime.minValue}
        max={gameCreationSchema.shape.drawingTime.maxValue}
        step="10"
        bind:value={drawingTime}
      />
    </div>

    <label for="rounds" class="font-semibold mt-6 text-white">Rounds</label>
    <div class="flex bg-zinc-800 rounded-sm p-3 mt-1">
      <span class="font-semibold mr-3 text-white">{rounds}</span>
      <input
        id="rounds"
        class="w-full accent-red-500"
        type="range"
        min={gameCreationSchema.shape.rounds.minValue}
        max={gameCreationSchema.shape.rounds.maxValue}
        bind:value={rounds}
      />
    </div>

    <button
      on:click={handleSubmit}
      type="button"
      class="text-white rounded-sm bg-red-500 font-semibold py-3 mt-12 hover:bg-red-400 focus:bg-red-400"
    >
      Create game
    </button>

    <button
      type="button"
      on:click={onCancel}
      class="absolute right-0 top-0 m-3 text-zinc-400 hover:text-zinc-200"
    >
      <CloseIcon class="w-7 fill-current" />
    </button>
  </form>
{/if}
