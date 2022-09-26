<script lang="ts">
  import type { Player } from "$lib/logic/shared";

  export let artist: string;
  export let players: Player[];

  $: artistName = players.find((p) => p.id === artist)?.username;
</script>

<div
  class="p-16 bg-zinc-800 rounded flex flex-col items-center text-center max-w-sm"
>
  <span class="font-bold text-3xl leading-relaxed">
    {artistName} is choosing...
  </span>
</div>
