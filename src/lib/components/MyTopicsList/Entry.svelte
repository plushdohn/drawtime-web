<script lang="ts">
  import EditTopicIcon from "../icons/EditTopicIcon.svelte";
  import RemoveIcon from "../icons/RemoveIcon.svelte";
  import TopicThumbnail from "../TopicThumbnail.svelte";
  import { slide } from "svelte/transition";
  import ConfirmIcon from "../icons/ConfirmIcon.svelte";
  import CloseIcon from "../icons/CloseIcon.svelte";
  import { deleteTopicWithWords } from "$lib/logic/client/database";
  import RedoIcon from "../icons/RedoIcon.svelte";
  import Spinner from "../Spinner.svelte";
  import axios from "axios";

  export let topic: { id: string; name: string; unlisted: boolean };
  export let deletionCallback: (topicId: string) => void;

  let deletionModalOpen = false;
  let deletionPending = false;
  let deletionError: string | null = null;

  const handleDeleteClick = () => {
    deletionModalOpen = true;
  };

  const handleDeleteCancelClick = () => {
    deletionModalOpen = false;
  };

  const handleDelete = async () => {
    deletionError = null;
    deletionPending = true;

    try {
      await axios.delete(`/api/topics/${topic.id}`);

      deletionCallback(topic.id);
    } catch (err) {
      deletionError = (err as Error).message;
    } finally {
      deletionPending = false;
    }
  };
</script>

<div class="relative w-full rounded-sm flex mb-4 bg-zinc-800">
  <div class="w-40 lg:w-52 shrink-0">
    <TopicThumbnail topicId={topic.id} class="w-full" />
  </div>
  <div class="w-full flex flex-col justify-center p-3 overflow-hidden">
    <span class="font-semibold text-lg truncate">
      {topic.name}
    </span>
  </div>

  <div class="p-3 flex lg:flex-col justify-center items-center gap-3 border-l-2 border-zinc-900">
    <a href={`/edit-topic/${topic.id}`} class="p-2 rounded bg-yellow-500 hover:bg-yellow-400">
      <EditTopicIcon class="w-6 fill-white" />
    </a>
    <button on:click={handleDeleteClick} class="p-2 rounded bg-red-500 hover:bg-red-400">
      <RemoveIcon class="w-6 fill-white" />
    </button>
  </div>

  {#if deletionModalOpen}
    <div
      class="absolute inset-0 bg-zinc-800 flex justify-center items-center gap-3"
      transition:slide
    >
      {#if deletionPending}
        <span class="font-semibold text-zinc-400">Deleting...</span>
        <Spinner class="w-6" />
      {:else if deletionError !== null}<span class="font-semibold text-zinc-400">
          An error occurred, retry?
        </span>
        <button on:click={handleDelete} class="p-2 rounded bg-red-500 hover:bg-red-400">
          <RedoIcon class="w-6 fill-white" />
        </button>
        <button
          on:click={handleDeleteCancelClick}
          class="p-2 rounded bg-zinc-700 hover:bg-zinc-600"
        >
          <CloseIcon class="w-6 fill-white" />
        </button>
      {:else}
        <span class="font-semibold text-zinc-400">Delete topic?</span>
        <button on:click={handleDelete} class="p-2 rounded bg-red-500 hover:bg-red-400">
          <ConfirmIcon class="w-6 fill-white" />
        </button>
        <button
          on:click={handleDeleteCancelClick}
          class="p-2 rounded bg-zinc-700 hover:bg-zinc-600"
        >
          <CloseIcon class="w-6 fill-white" />
        </button>
      {/if}
    </div>
  {/if}
</div>
