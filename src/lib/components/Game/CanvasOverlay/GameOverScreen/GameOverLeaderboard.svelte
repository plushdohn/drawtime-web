<script lang="ts">
  import WinnerIcon from "$lib/components/icons/WinnerIcon.svelte";
  import type { Player } from "$lib/logic/shared-types";

  export let players: Player[];

  const sortedPlayers = players.sort((a, b) => {
    if (a.score === b.score) return 0;
    else if (a.score === null) return 1;
    else if (b.score === null) return -1;
    else return b.score - a.score;
  });
</script>

<div class="flex flex-col w-full mt-4 ">
  <div class="flex flex-col justify-center items-center text-2xl">
    <WinnerIcon class="fill-yellow-500 w-8" />
    <img src={sortedPlayers[0].avatarUrl} class="w-16 h-16 rounded-full my-3" alt="" />
    <span class="font-semibold">{sortedPlayers[0].username}</span>
    <span class="text-green-400 font-bold">{sortedPlayers[0].score}</span>
  </div>
  <div class="flex flex-col mt-8 overflow-y-auto min-h-0 max-h-32">
    {#each sortedPlayers.slice(1) as player, i (player.id)}
      <div class="flex items-center w-full font-bold text-xl py-2 whitespace-nowrap">
        <span class="text-white font-semibold mr-4">{i + 2}</span>
        <div class="flex items-center bg-zinc-700 w-full rounded-full pr-4">
          <img src={player.avatarUrl} class="w-10 h-10 rounded-full mr-3" alt="" />
          <span class="text-white font-semibold text-base mr-12 w-full text-left">
            {player.username}
          </span>
          <span class="text-green-400">{player.score}</span>
        </div>
      </div>
    {/each}
  </div>
</div>
