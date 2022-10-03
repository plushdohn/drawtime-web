<script lang="ts">
  import CaptchaCheckbox from "$lib/components/Captcha.svelte";
  import AddIcon from "$lib/components/icons/AddIcon.svelte";
  import RemoveIcon from "$lib/components/icons/RemoveIcon.svelte";
  import { createForm } from "$lib/logic/client/form";
  import { z } from "zod";
  import CreationModal from "./Modal.svelte";
  import axios from "axios";
  import { createTopicSchema } from "$lib/logic/shared";
  import TopicThumbnail from "../TopicThumbnail.svelte";

  export let authToken: string;
  export let topic: {
    id: string;
    name: string;
    unlisted: boolean;
    nsfw: boolean;
    words: string[];
  };

  const { form, errors, validate, handleSubmit } = createForm(
    createTopicSchema().extend({
      captcha: z.string(),
    }),
    {
      name: topic.name,
      words: topic.words,
      nsfw: topic.nsfw,
      unlisted: topic.unlisted,
      thumbnail: null,
      captcha: null,
    },
    {
      onSubmit: async (values) => {
        creationPending = true;

        try {
          const res = await axios.post("/topics", {
            topic: {
              name: values.name,
              nsfw: values.nsfw,
              unlisted: values.unlisted,
              words: values.words,
              thumbnail: values.thumbnail,
            },
            authToken,
            captchaToken: values.captcha,
          });

          console.log(res.data);
        } catch (err) {
          console.warn("ERROR WHILE CREATING TOPIC:" + (err as Error).message);
          creationError = err as string;
        } finally {
          creationPending = false;
        }
      },
    }
  );

  let wordsBatchInputValue = "";
  let creationError: string | null = null;
  let creationPending = false;

  const onRemoveWordClick = (i: number) => () => {
    $form.words = $form.words.filter((item: any, index: number) => index !== i);

    validate("words");
  };

  const onAddWordClick = () => {
    $form.words = [...$form.words, ""];

    validate("words");
  };

  const onBatchAddWords = () => {
    if (!wordsBatchInputValue) return;

    $form.words = [
      ...$form.words,
      ...wordsBatchInputValue.split(",").map((w) => w.trim()),
    ];

    wordsBatchInputValue = "";

    validate("words");
  };

  const onFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;

    const files = target.files;

    if (!files || files.length === 0) {
      $form.thumbnail = null;
      validate("thumbnail");
    } else {
      const reader = new FileReader();
      reader.onloadend = function () {
        $form.thumbnail = reader.result as string;
        validate("thumbnail");
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const onCaptchaChange = (token: string | null) => {
    $form.captcha = token;

    validate("captcha");
  };

  const handleModalClosure = () => {
    creationError = null;
  };
</script>

<form class="flex flex-col max-w-2xl w-full">
  <span class="text-white font-bold text-5xl">Edit topic</span>

  <label for="name" class="text-zinc-300 font-bold mt-8 text-xl mb-2">
    Name
  </label>
  <input
    autocomplete="off"
    name="name"
    type="text"
    placeholder={`"Common fruits"; "Characters in a TV series"...`}
    class="p-3 rounded-sm bg-zinc-800 text-white border-red-500"
    class:border-2={$errors.name}
    bind:value={$form.name}
    on:input={validate}
  />
  {#if $errors.name}
    <span class="text-zinc-400 text-sm text-red-500 mt-2">
      {$errors.name}
    </span>
  {/if}

  <span class="text-zinc-300 font-bold mt-8 text-xl">Words</span>
  <span class="text-zinc-300 mb-2">
    There are currently {$form.words.length} word(s), the maximum for normal users
    is 100.
  </span>
  <div
    class="flex flex-col bg-zinc-800 rounded-sm p-3 border-red-500"
    class:border-2={$errors.words !== undefined ||
      Object.keys($errors).filter((k) => k.startsWith("words")).length > 0}
  >
    {#each $form.words as word, i}
      <div class="flex flex-col mb-3">
        <div class="flex">
          <input
            type="text"
            name={`words[${i}]`}
            class="w-full p-3 rounded-sm bg-zinc-700 text-white border-red-500"
            class:border-2={$errors[`words[${i}]`]}
            placeholder="Something..."
            bind:value={$form.words[i]}
            on:input={validate}
          />
          <button
            type="button"
            on:click={onRemoveWordClick(i)}
            class="bg-yellow-500 hover:bg-yellow-400 focus:bg-yellow-400 text-white w-24 ml-2 rounded-sm flex justify-center items-center"
          >
            <RemoveIcon class="w-7 fill-white" />
          </button>
        </div>
        {#if $errors[`words[${i}]`]}
          <span class="text-zinc-400 text-sm text-red-500 mt-1">
            {$errors[`words[${i}]`]}
          </span>
        {/if}
      </div>
    {/each}
    <button
      type="button"
      on:click={onAddWordClick}
      class="w-full font-bold py-2 text-white bg-red-500 hover:bg-red-400 focus:bg-red-400 rounded-sm flex items-center justify-center"
    >
      <AddIcon class="w-7 fill-white" />
    </button>
  </div>
  {#if $errors.words}
    <span class="text-zinc-400 text-sm text-red-500 mt-2">
      {$errors.words}
    </span>
  {/if}

  <span class="text-zinc-300 mb-2 mt-4">
    You can also add words in bulk as a comma-separated list
  </span>
  <div class="flex">
    <input
      type="text"
      placeholder="Banana, Apple, Mango..."
      class="p-3 rounded-sm bg-zinc-800 w-full"
      bind:value={wordsBatchInputValue}
    />
    <button
      type="button"
      on:click={onBatchAddWords}
      class="ml-2 bg-yellow-500 hover:bg-yellow-400 focus:bg-yellow-400 text-white w-24 rounded-sm flex justify-center items-center"
    >
      <AddIcon class="w-7 fill-white" />
    </button>
  </div>

  <label for="thumbnail" class="text-zinc-300 font-bold mt-8 text-xl mb-2">
    Thumbnail
  </label>
  <div
    class="p-3 bg-zinc-800 flex flex-col rounded-sm border-red-500"
    class:border-2={$errors.thumbnail}
  >
    <input
      name="thumbnail"
      type="file"
      accept=".png, .jpg, .jpeg"
      on:change={onFileChange}
    />
    {#if $form.thumbnail !== null}
      <img
        src={$form.thumbnail}
        class="w-full aspect-video object-cover mt-3 border border-zinc-700"
        alt="Playlist thumbnail"
      />
      <span class="text-xs text-center text-zinc-300 mt-2 self-center">
        This is how your thumbnail will appear, if there are cropping issues
        please use a 16:9 image.
      </span>
    {:else}
      <TopicThumbnail
        topicId={topic.id}
        class="w-full aspect-video object-cover mt-3 border border-zinc-700"
      />
    {/if}
  </div>
  {#if $errors.thumbnail}
    <span class="text-zinc-400 text-sm text-red-500 mt-2">
      {$errors.thumbnail}
    </span>
  {/if}

  <label for="nsfw" class="text-zinc-300 font-bold mt-8 text-xl">NSFW</label>
  <span class="text-zinc-300 mb-2">
    Does your word list contain NSFW words? Even if there's only one, please
    check this.
  </span>
  <input
    name="nsfw"
    type="checkbox"
    class="self-start w-8 h-8 accent-red-500 cursor-pointer"
    bind:checked={$form.nsfw}
  />

  <label for="unlisted" class="text-zinc-300 font-bold mt-8 text-xl">
    Unlisted
  </label>
  <span class="text-zinc-300 mb-2">
    If you check this, your playlist will not be indexed and cannot appear in
    the home page. It will only be accessed via direct link.
  </span>
  <input
    name="unlisted"
    type="checkbox"
    class="self-start w-8 h-8 accent-red-500 cursor-pointer"
    bind:checked={$form.unlisted}
  />

  <CaptchaCheckbox
    callback={onCaptchaChange}
    class={`mt-12 bg-zinc-900 border-red-500 border-red-500 self-start ${
      $errors.captcha ? "border-2" : ""
    }`}
  />
  {#if $errors.captcha}
    <span class="text-zinc-400 text-sm text-red-500 mt-2">
      Please complete the captcha.
    </span>
  {/if}

  <button
    on:click={handleSubmit}
    type="button"
    class="p-3 rounded-sm mt-12 font-semibold bg-red-500 w-full hover:bg-red-400 focus:bg-red-400 text-white"
  >
    Create playlist
  </button>

  {#if creationError || creationPending}
    <CreationModal
      error={creationError}
      onClose={handleModalClosure}
      onRetry={handleSubmit}
    />
  {/if}
</form>
