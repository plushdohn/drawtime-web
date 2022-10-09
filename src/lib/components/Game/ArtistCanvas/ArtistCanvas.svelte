<script lang="ts">
  import Clue from "../Clue.svelte";
  import CanvasOverlay from "../CanvasOverlay/CanvasOverlay.svelte";
  import ResetDrawingButton from "./ResetDrawingButton.svelte";
  import ColorPicker from "./ColorPicker.svelte";
  import GameTimer from "../GameTimer.svelte";
  import {
    DrawingEventKind,
    type DrawingStartEvent,
    GamePhase,
    type DrawingContinueEvent,
    type GameState,
  } from "$lib/logic/shared-types";
  import { updateDrawing } from "$lib/logic/client/live/drawing";
  import BrushSizeSelector from "./BrushSizeSelector.svelte";
  import type { ExtendedSocket } from "$lib/logic/client/live/types";

  export let game: GameState;
  export let socket: ExtendedSocket;
  export let userId: string;

  let color = "#000000";
  let size = 1;

  function onColorChange(newColor: string) {
    color = newColor;
  }

  function drawableCanvas(node: HTMLCanvasElement) {
    let currentEvent: DrawingStartEvent | DrawingContinueEvent | null = null;

    function beginNewEvent(evt: DrawingStartEvent | DrawingContinueEvent) {
      if (currentEvent !== null) {
        updateDrawing(socket, currentEvent);
      }

      currentEvent = evt;
    }

    function addToEventSequence(coords: { x: number; y: number }) {
      if (currentEvent === null) {
        currentEvent = {
          kind: DrawingEventKind.Continue,
          sequence: [coords],
        };
      } else {
        currentEvent = { ...currentEvent, sequence: [...currentEvent.sequence, coords] };
      }
    }

    const updateInterval = setInterval(() => {
      if (currentEvent !== null) {
        updateDrawing(socket, currentEvent);

        currentEvent = null;
      }
    }, 100);

    function getScaleAdjustedCoordinates(canvas: HTMLCanvasElement, e: PointerEvent) {
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
      ctx.lineWidth = size;

      beginNewEvent({
        kind: DrawingEventKind.Start,
        sequence: [{ x, y }],
        size,
        color,
      });
    }

    function onPointerUp() {
      node.removeEventListener("pointermove", onPointerMove);
    }

    function onPointerLeave() {
      node.removeEventListener("pointermove", onPointerMove);
    }

    const onPointerMove = (event: PointerEvent) => {
      const { x, y } = getScaleAdjustedCoordinates(node, event);

      ctx.lineTo(x, y);
      ctx.stroke();

      addToEventSequence({ x, y });
    };

    node.addEventListener("pointerdown", onPointerDown);

    return {
      destroy() {
        node.removeEventListener("pointerdown", onPointerDown);
        clearInterval(updateInterval);
      },
    };
  }
</script>

<div class="relative flex flex-col h-full">
  <Clue phase={game.phase} clue={game.clue} secret={game.secret} artist={game.artist} {userId} />
  <canvas class="h-[88%] bg-white aspect-square" width="512" height="512" use:drawableCanvas />
  <div class="w-full bg-zinc-800 flex justify-between items-center p-2" style="height: 6%;">
    <ResetDrawingButton />
    <BrushSizeSelector bind:value={size} />
    <ColorPicker callback={onColorChange} selectedColor={color} />
  </div>

  {#if game.phase === GamePhase.Drawing}
    <GameTimer {...game} />
  {/if}

  {#if game.phase !== GamePhase.Drawing}
    <CanvasOverlay {game} {userId} {socket} />
  {/if}
</div>
