<script lang="ts">
  import { z } from "zod";
  import { createForm } from "$lib/logic/client/form";
  import { guestUsernameSchema } from "$lib/logic/shared-types";
  import CloseIcon from "$lib/components/icons/CloseIcon.svelte";
  import CreateGameForm from "./CreateGameForm.svelte";
  import JoinGameForm from "./JoinGameForm.svelte";

  export let topicId: string;
  export let onCancel: () => void;
  export let auth: {
    accessToken: string;
    userId: string;
  } | null;

  enum InterfaceStatus {
    Choosing,
    Joining,
    Creating,
  }

  let status = InterfaceStatus.Choosing;

  const { form, errors, handleSubmit, valid, validate } = createForm(
    z.object({ username: guestUsernameSchema.nullable() }),
    {
      username: auth === null ? "" : null,
    },
    { onlyValidateAfterFirstSubmit: true }
  );

  function handleChooseCreateClick() {
    handleSubmit();

    if (!$valid) return;

    status = InterfaceStatus.Creating;
  }

  async function handleChooseJoinClick() {
    handleSubmit();

    if (!$valid) return;

    status = InterfaceStatus.Joining;
  }
</script>

<div class="fixed p-8 inset-0 w-full h-full bg-[#000000cc] flex justify-center items-center z-30">
  {#if status === InterfaceStatus.Choosing}
    <div class="relative p-8 sm:p-16 flex flex-col bg-zinc-900 rounded-sm w-full max-w-md">
      <span class="text-4xl font-bold text-white">Let's play!</span>
      {#if auth === null}
        <span class="text-zinc-400 mt-4 mb-1">What's your name?</span>
        <input
          type="text"
          name="username"
          placeholder="Username..."
          id="username"
          class="p-2.5 bg-zinc-800 rounded-sm border-red-500"
          bind:value={$form.username}
          on:input={validate}
          class:border={$errors.username}
        />

        {#if $errors.username}
          <span class="text-red-500 mt-1.5 text-xs">{$errors.username}</span>
        {/if}
        <hr class="border-1 w-full border-zinc-700 mt-6 mb-3" />
      {/if}

      <span class="text-zinc-400 mt-2">
        Do you want to join an existing game or would you like to create a new one?
      </span>
      <button
        disabled={!$valid}
        on:click={handleChooseJoinClick}
        class="mt-6 text-white bg-yellow-500 hover:bg-yellow-400 rounded-sm py-2.5 w-full font-semibold disabled:bg-zinc-600 disabled:cursor-not-allowed"
      >
        FIND GAME
      </button>
      <button
        disabled={!$valid}
        on:click={handleChooseCreateClick}
        class="mt-4 text-white bg-red-500 hover:bg-red-400 rounded-sm w-full py-2.5 font-semibold  disabled:bg-zinc-600 disabled:cursor-not-allowed"
      >
        CREATE GAME
      </button>
      <button
        type="button"
        on:click={onCancel}
        class="absolute right-0 top-0 m-3 text-zinc-400 hover:text-zinc-200"
      >
        <CloseIcon class="w-7 fill-current" />
      </button>
    </div>
  {:else if status === InterfaceStatus.Creating}
    <CreateGameForm
      {onCancel}
      {topicId}
      authInfo={auth !== null ? auth : { guestUsername: $form.username }}
    />
  {:else if status === InterfaceStatus.Joining}
    <JoinGameForm
      {onCancel}
      {topicId}
      authInfo={auth !== null ? auth : { guestUsername: $form.username }}
    />
  {/if}
</div>
