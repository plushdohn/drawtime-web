<script lang="ts">
  import type { Player } from "$lib/logic/shared";

  export let players: Player[];
  export let artist: string;

  const sortedPlayers = players.sort((a, b) => {
    if (a.score === b.score) return 0;
    else if (a.score === null) return 1;
    else if (b.score === null) return -1;
    else return b.score - a.score;
  });

  const worstGuess = players.reduce((acc, curr) => {
    if (curr.guessIndex !== null && curr.guessIndex > acc) return curr.guessIndex;

    return acc;
  }, -1);
</script>

<div class="flex flex-col w-full">
  {#each sortedPlayers as player (player.id)}
    <div class="flex items-center w-full font-bold text-2xl py-2 whitespace-nowrap">
      <img src={player.avatarUrl} class="w-8 h-8 rounded-full mr-3" alt="" />
      <span class="text-white font-semibold text-base mr-8 w-full text-left">
        {player.username}
      </span>
      {#if player.id === artist}
        {#if worstGuess === -1}
          <span class="text-white">{player.score}</span>
        {:else}
          <span class="text-green-400">{player.score}</span>
        {/if}
      {:else if player.guessIndex === null}
        <span class="text-white">{player.score}</span>
      {:else}
        <span class="text-green-400">{player.score}</span>
      {/if}
    </div>
  {/each}
</div>
