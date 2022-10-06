<script lang="ts">
  import { subscribeToDrawingUpdates } from "$lib/logic/client/live/drawing";
  import { registerListenerToSpecificSocketEvent } from "$lib/logic/client/live/socket";
  import {
    GamePhase,
    type RoundStartedEvent,
    ServerEventKind,
    type GameState,
    DrawingEventKind,
  } from "$lib/logic/shared";
  import CanvasOverlay from "../CanvasOverlay/CanvasOverlay.svelte";
  import Clue from "../Clue.svelte";
  import GameTimer from "../GameTimer.svelte";

  export let game: GameState;
  export let userId: string;
  export let socket: WebSocket;

  function clearOnRoundChange(node: HTMLCanvasElement) {
    const ctx = node.getContext("2d") as CanvasRenderingContext2D;

    const unsub = registerListenerToSpecificSocketEvent<RoundStartedEvent>(
      ServerEventKind.ROUND_STARTED,
      () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, node.width, node.height);
      }
    );

    return {
      destroy() {
        unsub();
      },
    };
  }

  function remoteDrawing(node: HTMLCanvasElement) {
    const ctx = node.getContext("2d") as CanvasRenderingContext2D;

    const unsub = subscribeToDrawingUpdates((update) => {
      if (update.kind === DrawingEventKind.Start || update.kind === DrawingEventKind.Continue) {
        if (update.kind === DrawingEventKind.Start) {
          ctx.beginPath();
          ctx.strokeStyle = update.color;
          ctx.lineWidth = update.size;
        }

        for (const coords of update.sequence) {
          ctx.lineTo(coords.x, coords.y);
          ctx.stroke();
        }
      } else if (update.kind === DrawingEventKind.Clear) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, node.width, node.height);
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
    class="h-[88%] bg-white aspect-square"
    width="512"
    height="512"
    use:remoteDrawing
    use:clearOnRoundChange
  />
  <div class="w-full bg-white" style="height: 6%;" />

  {#if game.phase === GamePhase.Drawing}
    <GameTimer {...game} />
  {/if}

  {#if game.phase !== GamePhase.Drawing}
    <CanvasOverlay {game} {userId} {socket} />
  {/if}
</div>
