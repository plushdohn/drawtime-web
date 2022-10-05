<script lang="ts">
  import { DrawingUpdateKind, subscribeToDrawingUpdates } from "$lib/logic/client/live/drawing";
  import { GamePhase, type GameState } from "$lib/logic/shared";
  import CanvasOverlay from "../CanvasOverlay/CanvasOverlay.svelte";
  import Clue from "../Clue.svelte";
  import GameTimer from "../GameTimer.svelte";

  export let game: GameState;
  export let userId: string;
  export let socket: WebSocket;

  let canvas: HTMLCanvasElement | null = null;

  $: if (game.phase === GamePhase.Drawing) {
    if (canvas !== null) {
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function remoteDrawing(node: HTMLCanvasElement) {
    const ctx = node.getContext("2d") as CanvasRenderingContext2D;

    const unsub = subscribeToDrawingUpdates((update) => {
      if (update.kind === DrawingUpdateKind.START) {
        ctx.beginPath();
        ctx.moveTo(update.x, update.y);
        ctx.strokeStyle = update.color;
      } else {
        ctx.lineTo(update.x, update.y);
        ctx.stroke();
      }
    });

    return {
      destroy() {
        unsub();
      },
    };
  }
</script>

<div class="relative flex flex-col h-full">
  <Clue {...game} {userId} />
  <canvas
    bind:this={canvas}
    class="h-[88%] bg-white aspect-square"
    width="512"
    height="512"
    use:remoteDrawing
  />
  <div class="w-full bg-white" style="height: 6%;" />

  {#if game.phase === GamePhase.Drawing}
    <GameTimer {...game} />
  {/if}

  {#if game.phase !== GamePhase.Drawing}
    <CanvasOverlay {game} {userId} {socket} />
  {/if}
</div>
