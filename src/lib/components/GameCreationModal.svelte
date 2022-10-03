<script lang="ts">
  import { goto } from "$app/navigation";
  import Spinner from "$lib/components/Spinner.svelte";
  import { authStore } from "$lib/logic/client/auth";
  import { createGame } from "$lib/logic/client/live/game";
  import {
    connectToGameServer,
    gameServerConnectionStore,
  } from "$lib/logic/client/live/socket";

  export let topicId: string;
  export let onCancel: () => void;

  let drawingTime = 60;
  let rounds = 8;
  let pending = false;
  let error: string | null = null;

  const handleSubmit = async () => {
    pending = true;
    error = null;

    let socket = $gameServerConnectionStore.socket;

    if (!socket) {
      try {
        socket = await connectToGameServer($authStore?.accessToken as string);
      } catch (err) {
        error = (err as Error).message;
        pending = false;
        return;
      }
    }

    try {
      const gameId = await createGame(socket, { topicId, drawingTime, rounds });

      await goto(`/g/${gameId}`);
    } catch (err) {
      error = (err as Error).message;
    } finally {
      pending = false;
    }
  };
</script>

<div
  class="fixed p-8 inset-0 w-full h-full bg-[#000000aa] flex justify-center items-center z-10"
>
  {#if pending}
    <div
      class="p-8 sm:p-16 flex flex-col items-center bg-zinc-900 rounded-sm max-w-xs w-full"
    >
      <Spinner class="w-8 mb-4 self-center" />
      <span class="text-zinc-400 text-center self-center">
        Creating game...
      </span>
    </div>
  {:else if error !== null}
    <div
      class="p-8 sm:p-16 flex flex-col items-center bg-zinc-900 rounded-sm max-w-xs w-full"
    >
      <span class="text-3xl font-bold">Oh no!</span>
      <span class="text-zinc-400 text-center mt-1.5">
        Couldn't reach game servers.
      </span>
      <button
        type="button"
        on:click={handleSubmit}
        class="bg-red-500 hover:bg-red-400 font-semibold rounded-sm mt-8 py-3 w-full"
      >
        Retry
      </button>
      <button
        type="button"
        on:click={onCancel}
        class="bg-zinc-700 hover:bg-zinc-600 font-semibold rounded-sm mt-3 py-3 w-full"
      >
        Cancel
      </button>
    </div>
  {:else}
    <form
      class="p-8 sm:p-16 flex flex-col bg-zinc-900 rounded-sm max-w-md w-full"
    >
      <span class="font-bold text-4xl">Create game</span>
      <span class="text-zinc-500 mt-2">Set the game's parameters.</span>

      <label for="drawingTime" class="font-semibold mt-10">Drawing time</label>
      <div class="flex bg-zinc-800 rounded-sm p-3 mt-1">
        <span class="font-semibold mr-3">{drawingTime}</span>
        <input
          id="drawingTime"
          class="w-full accent-red-500"
          type="range"
          min="10"
          max="90"
          step="10"
          bind:value={drawingTime}
        />
      </div>

      <label for="rounds" class="font-semibold mt-6">Rounds</label>
      <div class="flex bg-zinc-800 rounded-sm p-3 mt-1">
        <span class="font-semibold mr-3">{rounds}</span>
        <input
          id="rounds"
          class="w-full accent-red-500"
          type="range"
          min="2"
          max="16"
          bind:value={rounds}
        />
      </div>

      <button
        on:click={handleSubmit}
        type="button"
        class="rounded-sm bg-red-500 font-semibold py-3 mt-12 hover:bg-red-400 focus:bg-red-400"
      >
        Create game
      </button>
      <button
        on:click={onCancel}
        type="button"
        class="rounded-sm font-semibold py-3 mt-4 bg-zinc-700 hover:bg-zinc-600 focus:bg-zinc-600"
      >
        Cancel
      </button>
    </form>
  {/if}
</div>
