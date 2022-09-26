<script lang="ts">
  import {
    DrawingUpdateKind,
    GamePhase,
    ServerEvent,
    type GameState,
  } from "$lib/logic/shared";
  import { subscribeToSocketEvents } from "$lib/logic/client/sockets";
  import CanvasOverlay from "../CanvasOverlay/CanvasOverlay.svelte";
  import Clue from "../Clue.svelte";
  import GameTimer from "../GameTimer.svelte";

  export let game: GameState;
  export let userId: string;
  export let socket: WebSocket;

  function remoteDrawing(node: HTMLCanvasElement) {
    const ctx = node.getContext("2d") as CanvasRenderingContext2D;

    const unsub = subscribeToSocketEvents(([command, args]) => {
      if (command === ServerEvent.DRAWING_UPDATE) {
        const [kind, x, y, size, color] = args;

        if (kind === DrawingUpdateKind.Start) {
          ctx.beginPath();
          ctx.moveTo(Number(x), Number(y));
          ctx.strokeStyle = color;
        } else {
          ctx.lineTo(Number(x), Number(y));
          ctx.stroke();
        }
      }
    });

    return {
      destroy() {
        if (unsub) unsub();
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
  />
  <div class="w-full bg-white" style="height: 6%;" />

  {#if game.phase === GamePhase.Drawing}
    <GameTimer {...game} />
  {/if}

  {#if game.phase !== GamePhase.Drawing}
    <CanvasOverlay {game} {userId} {socket} />
  {/if}
</div>
