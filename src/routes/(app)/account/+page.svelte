<script lang="ts">
  import { createForm } from "$lib/logic/client/form";
  import { z } from "zod";
  import { page } from "$app/stores";
  import ApplyChangesIcon from "$lib/components/icons/ApplyChangesIcon.svelte";
  import axios from "axios";
  import Spinner from "$lib/components/Spinner.svelte";
  import { invalidateAll } from "$app/navigation";

  const profile = $page.data.profile;

  let pending = false;
  let error: string | null = null;

  const { form, errors, validate, handleSubmit, valid } = createForm(
    z.object({
      username: z
        .string()
        .min(4, "Needs at least 4 characters")
        .max(32, "Can't have more than 32 characters")
        .regex(
          /^[A-Za-z0-9_.]*$/,
          "Can only use numbers, letters from A-Z, underscores or periods."
        ),
      propic: z.string().nullable(),
    }),
    {
      username: profile.username,
      propic: null,
    },
    {
      onSubmit: async (values) => {
        pending = true;
        error = null;

        try {
          await axios.patch("/account", {
            username: values.username,
            profilePicture: values.propic,
          });

          await invalidateAll();
        } catch (err) {
          error = (err as Error).message;
        } finally {
          pending = false;
        }
      },
    }
  );

  function handlePropicChange(e: Event) {
    const files = (e.target as HTMLInputElement).files;

    if (files === null || files.length === 0) {
      $form.propic = null;
    } else {
      const reader = new FileReader();
      reader.onloadend = function () {
        $form.propic = reader.result as string;

        validate("propic");
      };
      reader.readAsDataURL(files[0]);
    }
  }

  $: changed = $form.username !== profile.username || $form.propic !== null;
</script>

<svelte:head>
  <title>Drawtime.io | Account</title>
</svelte:head>

<form class="flex flex-col justify-start p-8 lg:p-16 max-w-2xl">
  <span class="text-4xl font-bold text-white">Account settings</span>

  <label for="username" class="font-semibold mt-12">Username</label>
  <span class="text-zinc-400">
    The name with which everyone will see you in game and on your topics.
  </span>
  <input
    id="username"
    type="text"
    name="username"
    placeholder="Username..."
    class="mt-1 p-2.5 bg-zinc-800 rounded-sm"
    bind:value={$form.username}
    on:input={validate}
  />
  {#if $errors.username}
    <span class="text-red-500 text-xs mt-1">{$errors.username}</span>
  {/if}

  <label for="propic" class="font-semibold mt-8 mb-1">Profile picture</label>
  <input
    type="file"
    id="propic"
    class="mb-2 self-start"
    name="propic"
    on:change={handlePropicChange}
    accept=".png, .jpg, .jpeg"
  />
  <div class="self-start bg-zinc-800 rounded-sm p-3">
    <img
      src={$form.propic ?? profile.avatarUrl}
      class="w-48 rounded-full aspect-square object-cover border border-zinc-700"
      alt="User avatar"
    />
  </div>

  <button
    type="button"
    on:click={handleSubmit}
    class={`font-semibold p-2.5 rounded-sm mt-10 self-start flex items-center bg-red-500 disabled:text-zinc-400 disabled:bg-zinc-700`}
    disabled={!changed || !$valid}
  >
    <ApplyChangesIcon class="fill-current w-6 mr-2" />
    Apply changes
  </button>
</form>

{#if pending || error !== null}
  <div class="fixed z-10 inset-0 bg-[#000000aa] flex justify-center items-center">
    <div class="flex flex-col items-center p-16 bg-zinc-900 rounded-sm max-w-sm w-full">
      {#if pending}
        <Spinner class="w-7 mb-4" />
        <span class="text-zinc-400">Applying changes...</span>
      {:else}
        <span class="text-4xl font-bold">Oh no!</span>
        <span class="text-zinc-400 mt-1">An error has occurred.</span>

        <button
          class="bg-red-500 hover:bg-red-400 font-semibold p-2.5 w-full rounded-sm mt-8"
          on:click={handleSubmit}
        >
          Retry
        </button>
        <button
          class="bg-zinc-700 hover:bg-zinc-600 font-semibold p-2.5 w-full rounded-sm mt-3"
          on:click={() => (error = null)}
        >
          Cancel
        </button>
      {/if}
    </div>
  </div>
{/if}
