<script lang="ts">
  import { GamePhase } from "$lib/logic/shared-types";
  import { tweened } from "svelte/motion";

  const progress = tweened(100);

  export let phase: GamePhase;
  export let drawingTime = 60;

  $: switch (phase) {
    case GamePhase.Drawing:
      progress.set(100, { duration: 0 });
      progress.set(0, {
        duration: drawingTime * 1000,
      });
      break;
    case GamePhase.Choosing:
      progress.set(100, { duration: 0 });
      progress.set(0, {
        duration: 10000,
      });
      break;
    case GamePhase.Transitioning:
      progress.set(100, { duration: 0 });
      progress.set(0, {
        duration: 7000,
      });
      break;
  }
</script>

<div
  class="bg-yellow-500 absolute inset-0 h-1.5 w-full"
  style={`transform: scaleX(${$progress}%);`}
/>
