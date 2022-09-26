<script lang="ts">
  import ArtistIcon from "$lib/components/icons/ArtistIcon.svelte";
  import type { Player } from "$lib/logic/shared";
  import { flip } from "svelte/animate";

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
    <div class="flex items-center my-2 p-4 rounded-l bg-zinc-800" animate:flip>
      <img
        class="w-10 h-10 rounded-full"
        src={player.avatarUrl}
        alt={player.username}
        referrerpolicy="no-referrer"
      />
      <div
        class="flex-grow flex flex-col justify-center items-start ml-4 pr-10"
      >
        <span class="text-white font-semibold">{player.username}</span>
        {#if player.score !== null}
          <span class="text-zinc-300 italic text-xs">
            {player.score} points
          </span>
        {/if}
      </div>
      {#if player.id === artistId}
        <ArtistIcon class="w-8 fill-yellow-500" />
      {:else}
        <div
          class="w-6 h-6 rounded-full bg-zinc-900"
          class:bg-green-400={player.guessIndex !== null &&
            player.guessIndex !== 0}
        />
      {/if}
    </div>
  {/each}
</div>
