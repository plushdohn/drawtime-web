<script lang="ts">
  import { GamePhase } from "$lib/logic/shared-types";

  export let phase: GamePhase;
  export let clue: string | null;
  export let secret: string | null;
  export let artist: string;
  export let userId: string;
</script>

<div
  class="landscape:h-[5%] portrait:h-14 bg-red-500 w-full flex items-center justify-center font-semibold tracking-widest text-center text-2xl lg:text-3xl uppercase"
>
  {#if phase === GamePhase.Drawing}
    {#if artist === userId}
      {secret}
    {:else if clue !== null}
      {clue}
    {/if}
  {:else}
    &nbsp;
  {/if}
</div>
