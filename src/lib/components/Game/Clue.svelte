<script lang="ts">
  import { GamePhase } from "$lib/logic/shared";

  export let phase: GamePhase;
  export let clue: string | null;
  export let secret: string | null;
  export let artist: string;
  export let userId: string;
</script>

<div
  class="h-[6%] bg-red-500 w-full flex items-center justify-center font-semibold tracking-widest text-3xl uppercase"
>
  {#if phase === GamePhase.Drawing}
    {#if artist === userId}
      {secret}
    {:else if clue !== null}
      {clue}
    {/if}
  {/if}
</div>
