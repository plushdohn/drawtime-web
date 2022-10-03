<script lang="ts">
  import TopicThumbnail from "../TopicThumbnail.svelte";

  export let thumbnail: string | null;
  export let error: string | undefined = undefined;
  export let topicId: string | null = null;
  export let validate: (e: string) => void;

  async function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;

    const files = target.files;

    if (!files || files.length === 0) {
      thumbnail = null;
    } else {
      thumbnail = await new Promise((res) => {
        const reader = new FileReader();
        reader.onloadend = function () {
          res(reader.result as string);
        };
        reader.readAsDataURL(files[0]);
      });
    }

    validate("thumbnail");
  }
</script>

<label for="thumbnail" class="font-semibold mt-6 mb-1">Thumbnail</label>
<div
  class="p-2.5 bg-zinc-800 flex flex-col rounded-sm border-red-500"
  class:border-2={error !== undefined}
>
  <input name="thumbnail" type="file" accept=".png, .jpg, .jpeg" on:change={handleFileChange} />
  {#if thumbnail !== null}
    <img
      src={thumbnail}
      class="w-full aspect-video object-cover mt-3 border border-zinc-700"
      alt="Playlist thumbnail"
    />
    <span class="text-xs text-center text-zinc-300 mt-2 self-center">
      This is how your thumbnail will appear, if there are cropping issues please use a 16:9 image.
    </span>
  {:else if topicId !== null}
    <TopicThumbnail
      {topicId}
      class="w-full aspect-video object-cover mt-3 border border-zinc-700"
    />
  {/if}
</div>
{#if error !== undefined}
  <span class="text-zinc-400 text-sm text-red-500 mt-2">
    {error}
  </span>
{/if}
