<script lang="ts">
  import ArtistIcon from "$lib/components/icons/ArtistIcon.svelte";
  import type { Player } from "$lib/logic/shared-types";
  import { flip } from "svelte/animate";
  import DisconnectedIcon from "../icons/DisconnectedIcon.svelte";

  export let players: Player[];
  export let artistId: string;

  $: sorted = players.sort((a, b) => {
    if (a.score === b.score) return 0;
    else if (a.score === null) return 1;
    else if (b.score === null) return -1;
    else return b.score - a.score;
  });
</script>

<div class="flex flex-col">
  {#each sorted as player (player.id)}
    <div class="flex items-center gap-4 my-2 p-4 rounded-l bg-zinc-800" animate:flip>
      <img
        class="w-10 h-10 rounded-full"
        class:grayscale={player.disconnected}
        src={player.avatarUrl}
        alt={player.username}
        referrerpolicy="no-referrer"
      />
      <div class="w-full flex flex-col justify-center items-start">
        <span class="font-semibold truncate w-24" class:text-zinc-500={player.disconnected}>
          {player.username}
        </span>
        {#if player.score !== null}
          <span class="text-zinc-300 italic text-xs">
            {player.score} points
          </span>
        {/if}
      </div>
      {#if player.disconnected}
        <DisconnectedIcon class="w-8 fill-zinc-500 shrink-0" />
      {:else if player.id === artistId}
        <ArtistIcon class="w-8 fill-yellow-500 shrink-0" />
      {:else}
        <div
          class="w-6 h-6 rounded-full bg-zinc-900 shrink-0"
          class:bg-green-400={player.guessIndex !== null}
        />
      {/if}
    </div>
  {/each}
</div>
