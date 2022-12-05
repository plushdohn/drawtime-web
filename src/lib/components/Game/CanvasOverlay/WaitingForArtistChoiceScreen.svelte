<script lang="ts">
  import { GamePhase, type Player } from "$lib/logic/shared-types";
  import GameTimer from "../GameTimer.svelte";

  export let artist: string;
  export let players: Player[];

  $: artistName = players.find((p) => p.id === artist)?.username;
</script>

<div
  class="relative p-8 lg:p-16 bg-zinc-800 rounded flex flex-col items-center text-center max-w-sm"
>
  <span class="font-bold text-3xl leading-relaxed">
    {artistName} is choosing...
  </span>

  <GameTimer phase={GamePhase.Choosing} />
</div>
