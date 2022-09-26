<script lang="ts">
  import Clue from "../Clue.svelte";
  import CanvasOverlay from "../CanvasOverlay/CanvasOverlay.svelte";
  import ResetDrawingButton from "./ResetDrawingButton.svelte";
  import ColorPicker from "./ColorPicker.svelte";
  import GameTimer from "../GameTimer.svelte";
  import {
    DrawingUpdateKind,
    GamePhase,
    type GameState,
  } from "$lib/logic/shared";
  import { sendDrawingUpdate } from "$lib/logic/client/game";

  export let game: GameState;
  export let socket: WebSocket;
  export let userId: string;

  let color = "#000000";

  function onColorChange(newColor: string) {
    color = newColor;
  }

  const drawableCanvas = (node: HTMLCanvasElement) => {
    function getScaleAdjustedCoordinates(
      canvas: HTMLCanvasElement,
      e: PointerEvent
    ) {
      const elementRelativeX = e.offsetX;
      const elementRelativeY = e.offsetY;
      const x = (elementRelativeX * canvas.width) / canvas.clientWidth;
      const y = (elementRelativeY * canvas.height) / canvas.clientHeight;

      return { x, y };
    }

    const ctx = node.getContext("2d") as CanvasRenderingContext2D;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, node.width, node.height);

    function onPointerDown(event: PointerEvent) {
      node.addEventListener("pointermove", onPointerMove);
      node.addEventListener("pointerup", onPointerUp);
      node.addEventListener("pointerleave", onPointerLeave);

      const { x, y } = getScaleAdjustedCoordinates(node, event);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = color;

      sendDrawingUpdate(socket, [DrawingUpdateKind.Start, x, y, 1, color]);
    }

    function onPointerUp(event: PointerEvent) {
      node.removeEventListener("pointermove", onPointerMove);
    }

    function onPointerLeave(event: PointerEvent) {
      node.removeEventListener("pointermove", onPointerMove);
    }

    function onPointerMove(event: PointerEvent) {
      const { x, y } = getScaleAdjustedCoordinates(node, event);

      ctx.lineTo(x, y);
      ctx.stroke();

      sendDrawingUpdate(socket, [DrawingUpdateKind.Continue, x, y, 1, color]);
    }

    node.addEventListener("pointerdown", onPointerDown);

    return {
      destroy() {
        node.removeEventListener("pointerdown", onPointerDown);
      },
    };
  };
</script>

<div class="relative flex flex-col h-full">
  <Clue
    phase={game.phase}
    clue={game.clue}
    secret={game.secret}
    artist={game.artist}
    {userId}
  />
  <canvas
    class="h-[88%] bg-white aspect-square"
    width="512"
    height="512"
    use:drawableCanvas
  />
  <div
    class="w-full bg-zinc-800 flex justify-between items-center p-2"
    style="height: 6%;"
  >
    <ResetDrawingButton />
    <ColorPicker callback={onColorChange} selectedColor={color} />
  </div>

  {#if game.phase === GamePhase.Drawing || game.phase === GamePhase.Choosing || game.phase === GamePhase.Transitioning}
    <GameTimer {...game} />
  {/if}

  {#if game.phase !== GamePhase.Drawing}
    <CanvasOverlay {game} {userId} {socket} />
  {/if}
</div>
