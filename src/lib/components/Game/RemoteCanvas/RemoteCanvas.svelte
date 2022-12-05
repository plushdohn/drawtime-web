<script lang="ts">
  import { floodFillCanvas } from "$lib/logic/client/canvas";
  import { subscribeToDrawingUpdates } from "$lib/logic/client/live/drawing";
  import type { ExtendedSocket } from "$lib/logic/client/live/types";
  import {
    GamePhase,
    type GameState,
    DrawingEventKind,
    type Player,
  } from "$lib/logic/shared-types";
  import CanvasOverlay from "../CanvasOverlay/CanvasOverlay.svelte";
  import Clue from "../Clue.svelte";
  import GameTimer from "../GameTimer.svelte";

  export let game: GameState;
  export let userId: string;
  export let socket: ExtendedSocket;

  $: artist = game.players.find((p) => p.id === game.artist);

  function clearOnRoundChange(node: HTMLCanvasElement) {
    const ctx = node.getContext("2d") as CanvasRenderingContext2D;

    function handleRoundStart() {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, node.width, node.height);
    }

    socket.on("roundStarted", handleRoundStart);

    return {
      destroy() {
        socket.off("roundStarted", handleRoundStart);
      },
    };
  }

  function remoteDrawing(node: HTMLCanvasElement) {
    const ctx = node.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;

    const unsub = subscribeToDrawingUpdates(socket, (update) => {
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
      } else if (update.kind === DrawingEventKind.Fill) {
        floodFillCanvas(node, update.x, update.y, update.color);
      }
    });

    return {
      destroy() {
        unsub();
      },
    };
  }
</script>

<div class="shrink-0 relative flex flex-col">
  <Clue artist={game.artist} clue={game.clue} phase={game.phase} secret={game.secret} {userId} />
  <canvas
    class="portrait:w-full bg-white aspect-square landscape:h-[90%]"
    width="512"
    height="512"
    use:remoteDrawing
    use:clearOnRoundChange
  />
  <div
    class="w-full flex items-center justify-center text-center bg-zinc-800 landscape:h-[5%] portrait:h-12 shrink-0 uppercase font-bold text-white text-xl"
  >
    {#if artist}
      <span>
        <span class="text-yellow-500">{artist.username}</span>
        is drawing
      </span>
    {/if}
  </div>

  {#if game.phase === GamePhase.Drawing}
    <GameTimer phase={game.phase} drawingTime={game.drawingTime} />
  {/if}

  {#if game.phase !== GamePhase.Drawing}
    <CanvasOverlay {game} {userId} {socket} />
  {/if}
</div>
