<script lang="ts">
  import { page } from "$app/stores";
  import Spinner from "$lib/components/Spinner.svelte";
  import { connectToGameServer, gameServerConnectionStore } from "$lib/logic/client/live/socket";
  import { onMount } from "svelte";
  import Game from "$lib/components/Game/index.svelte";
  import type { PageData } from "./$types";
  import { createForm } from "$lib/logic/client/form";
  import { guestUsernameSchema } from "$lib/logic/shared-types";
  import { z } from "zod";

  const gameId = $page.params.gameId;

  export let data: PageData;

  const { form, errors, valid, handleSubmit, validate } = createForm(
    z.object({
      username: guestUsernameSchema,
    }),
    {
      username: "",
    },
    {
      onSubmit: async (values) => {
        connectToGameServer({ guestUsername: values.username });
      },
    }
  );

  $: user = data.session.user ?? null;

  onMount(async () => {
    if (user !== null && $gameServerConnectionStore.socket === null) {
      connectToGameServer({
        authToken: data.session.accessToken!,
        userId: data.session.user!.id,
      });
    }
  });

  function reconnect() {
    if (user !== null) {
      connectToGameServer({
        authToken: data.session.accessToken!,
        userId: data.session.user!.id,
      });
    } else {
      connectToGameServer({
        guestUsername: $form.username,
      });
    }
  }

  $: console.log($errors);
</script>

<svelte:head>
  <title>Drawtime.io | Game</title>
</svelte:head>

<div class="w-full h-screen bg-zinc-900 flex justify-center items-center">
  {#if $gameServerConnectionStore.socket !== null && $gameServerConnectionStore.error === null}
    <Game
      {gameId}
      socket={$gameServerConnectionStore.socket}
      socketError={$gameServerConnectionStore.error}
    />
  {:else}
    <div
      class="p-16 flex flex-col justfy-center items-center bg-zinc-800 rounded-sm max-w-sm text-center w-full"
    >
      {#if $gameServerConnectionStore.error !== null}
        <span class="font-bold text-4xl">Oh no!</span>
        <span class="text-zinc-400 mt-2">Lost connection to game servers.</span>

        <button
          on:click={reconnect}
          class="bg-red-500 font-semibold hover:bg-red-400 py-2.5 rounded-sm w-full mt-4"
        >
          Reconnect
        </button>
      {:else if user === null}
        <span class="font-bold text-4xl">Join room</span>
        <span class="text-zinc-400 mt-1">Please enter a username.</span>

        <input
          type="text"
          placeholder="Username..."
          name="username"
          bind:value={$form.username}
          on:change={validate}
          class="bg-zinc-700 rounded-sm p-2.5 mt-6 w-full border-red-500"
          class:border={$errors.username}
        />

        {#if $errors.username}
          <span class="text-red-500 mt-1.5 text-xs">{$errors.username}</span>
        {/if}

        <button
          on:click={handleSubmit}
          type="button"
          class="w-full rounded-sm bg-red-500 font-semibold py-2.5 mt-4 hover:bg-red-400 focus:bg-red-400 disabled:bg-zinc-600 disabled:cursor-not-allowed"
          disabled={!$valid}
        >
          Join room
        </button>
        <span class="text-sm text-zinc-400 mt-1.5">
          or <a
            class="font-semibold hover:underline focus:underline"
            href={`/login?next=${encodeURIComponent(`/g/${gameId}`)}`}
          >
            create an account
          </a>
        </span>
      {:else}
        <Spinner class="w-7" />
        <span class="text-zinc-400 mt-4">Connecting to server...</span>
      {/if}
    </div>
  {/if}
</div>
