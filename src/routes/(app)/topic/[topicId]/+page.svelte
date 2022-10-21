<script lang="ts">
  import PlayTopicIcon from "$lib/components/icons/PlayTopicIcon.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  const date = new Date(data.topic.createdAt);
</script>

<div class="flex flex-col justify-start max-w-md w-full p-8 lg:p-16 text-zinc-400">
  <span class="text-4xl text-white font-bold">{data.topic.name}</span>
  <span class="mt-4">
    Created by <span class="font-semibold">{data.topic.creator.username}</span>
  </span>
  <span>
    Date of creation: <span class="font-semibold">{date.toDateString()}</span>
  </span>
  <span>
    NSFW: <span
      class="font-semibold"
      class:text-red-500={data.topic.nsfw}
      class:text-green-500={!data.topic.nsfw}
    >
      {data.topic.nsfw ? "YES" : "NO"}
    </span>
  </span>
  <span>
    Public:
    <span
      class="font-semibold"
      class:text-red-500={data.topic.unlisted}
      class:text-green-500={!data.topic.unlisted}
    >
      {data.topic.unlisted ? "NO" : "YES"}
    </span>
  </span>

  <button
    class="mt-6 bg-red-500 hover:bg-red-400 py-2.5 px-6 font-semibold rounded-sm inline-flex justify-center gap-2"
  >
    <PlayTopicIcon class="w-6 fill-white" />
    <span class="text-white">Play topic</span>
  </button>
</div>
