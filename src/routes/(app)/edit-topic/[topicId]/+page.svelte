<script lang="ts">
  import { goto } from "$app/navigation";
  import FancyButton from "$lib/components/FancyButton.svelte";
  import FullScreenModal from "$lib/components/FullScreenModal.svelte";
  import Spinner from "$lib/components/Spinner.svelte";
  import TopicFormCaptcha from "$lib/components/TopicForm/TopicFormCaptcha.svelte";
  import TopicFormCheckbox from "$lib/components/TopicForm/TopicFormCheckbox.svelte";
  import TopicFormName from "$lib/components/TopicForm/TopicFormName.svelte";
  import TopicFormThumbnail from "$lib/components/TopicForm/TopicFormThumbnail.svelte";
  import TopicFormWords from "$lib/components/TopicForm/TopicFormWords.svelte";
  import { createForm } from "$lib/logic/client/form";
  import { createTopicSchema } from "$lib/logic/shared-types";
  import type { PageData } from "./$types";
  import axios from "axios";
  import { z } from "zod";
  import { dev } from "$app/environment";

  let showModal = false;
  let pending = false;
  let error: string | null = null;

  export let data: PageData;

  const { form, errors, validate, handleSubmit } = createForm(
    createTopicSchema(dev).extend({ captchaToken: z.string(), thumbnail: z.string().nullable() }),
    {
      name: data.topic.name,
      unlisted: data.topic.unlisted,
      nsfw: data.topic.nsfw,
      words: data.topic.words,
      thumbnail: null,
      captchaToken: null,
    },
    {
      onlyValidateAfterFirstSubmit: true,
      onSubmit: async (values) => {
        error = null;
        pending = true;
        showModal = true;

        try {
          const res = await axios.patch(`/api/topics/${data.topic.id}`, values);

          console.log(res.data);
        } catch (err) {
          error = (err as Error).message;
          console.warn("An error occurred while editing topic:" + (err as Error).message);
        } finally {
          pending = false;
        }
      },
    }
  );

  async function goToHome() {
    await goto("/");
  }
</script>

<svelte:head>
  <title>Drawtime.io | Edit topic</title>
</svelte:head>

<div class="flex flex-col items-start p-8 lg:p-16 ">
  <form class="max-w-2xl w-full flex flex-col">
    <span class="font-bold text-4xl">Edit topic</span>

    <TopicFormName bind:value={$form.name} error={$errors.name} {validate} />

    <TopicFormWords bind:words={$form.words} errors={$errors} {validate} />

    <TopicFormCheckbox
      label="NSFW"
      description="Does your topic contain any NSFW words?"
      name="nsfw"
      bind:checked={$form.nsfw}
    />

    <TopicFormCheckbox
      label="Unlisted"
      description="If you check this, your topic won't be searchable and it won't appear in the home page. You can only share it via link."
      name="unlisted"
      bind:checked={$form.unlisted}
    />

    <TopicFormThumbnail
      bind:thumbnail={$form.thumbnail}
      error={$errors.thumbnail}
      {validate}
      topicId={data.topic.id}
    />

    <TopicFormCaptcha bind:token={$form.captchaToken} error={$errors.captchaToken} {validate} />

    <button
      on:click={handleSubmit}
      type="button"
      class="p-2.5 rounded-sm mt-12 font-semibold bg-red-500 w-full hover:bg-red-400"
    >
      Apply changes
    </button>
  </form>
</div>

{#if showModal}
  <FullScreenModal>
    {#if pending}
      <Spinner class="w-7" />
      <span class="text-zinc-400 mt-4">Editing topic...</span>
    {:else if error !== null}
      <span class="text-4xl font-bold">Oh no!</span>
      <span class="text-zinc-400 mt-1">An error has occurred.</span>

      <FancyButton class="w-full bg-red-500 hover:bg-red-400 mt-8" callback={handleSubmit}>
        Retry
      </FancyButton>
      <FancyButton
        class="w-full bg-zinc-700 hover:bg-zinc-600 mt-3"
        callback={() => (showModal = false)}
      >
        Cancel
      </FancyButton>
    {:else}
      <span class="text-4xl font-bold">Done!</span>
      <span class="text-zinc-400 mt-1">Your changes were applied.</span>

      <FancyButton class="w-full bg-red-500 hover:bg-red-400 mt-8" callback={goToHome}>
        Go to Home page
      </FancyButton>
      <FancyButton
        class="w-full bg-zinc-700 hover:bg-zinc-600 mt-3"
        callback={() => (showModal = false)}
      >
        Keep editing
      </FancyButton>
    {/if}
  </FullScreenModal>
{/if}
