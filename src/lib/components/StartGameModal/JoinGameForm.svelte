<script lang="ts">
  import { goto } from "$app/navigation";
  import { findGame, joinGame } from "$lib/logic/client/live/game";
  import { connectToGameServer } from "$lib/logic/client/live/socket";
  import { onMount } from "svelte";
  import Spinner from "../Spinner.svelte";

  enum ErrorPhase {
    Connection,
    Find,
  }

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

  let error: ErrorPhase | null = null;

  onMount(() => {
    findAndJoin();
  });

  async function findAndJoin() {
    error = null;

    try {
      const gameId = await findGame(topicId);

      try {
        const socket = await connectToGameServer(
          "guestUsername" in authInfo
            ? { guestUsername: authInfo.guestUsername }
            : { authToken: authInfo.accessToken, userId: authInfo.userId }
        );

        await goto(`/g/${gameId}`);
      } catch {
        error = ErrorPhase.Connection;
      }
    } catch (err) {
      console.log(JSON.stringify(err));

      error = ErrorPhase.Find;
    }
  }
</script>

{#if error === null}
  <div class="p-8 sm:p-16 flex flex-col items-center bg-zinc-900 rounded-sm max-w-xs w-full">
    <Spinner class="w-8 mb-4 self-center" />
    <span class="text-zinc-400 text-center self-center">Finding game...</span>
  </div>
{:else}
  <div class="p-8 sm:p-16 flex flex-col items-center bg-zinc-900 rounded-sm max-w-sm w-full">
    <span class="text-3xl font-bold">Oh no!</span>

    <span class="text-zinc-400 text-center mt-1.5">
      {#if error === ErrorPhase.Connection}
        Couldn't reach game servers.
      {:else if error === ErrorPhase.Find}
        Couldn't find a game.
      {/if}
    </span>

    <button
      type="button"
      on:click={findAndJoin}
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
{/if}
