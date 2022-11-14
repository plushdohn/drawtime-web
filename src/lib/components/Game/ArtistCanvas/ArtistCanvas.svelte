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
  import BrushButton from "./BrushButton.svelte";
  import EraserButton from "./EraserButton.svelte";
  import FillButton from "./FillButton.svelte";
  import { floodFillCanvas } from "$lib/logic/client/canvas";

  export let game: GameState;
  export let socket: ExtendedSocket;
  export let userId: string;

  enum ToolKind {
    Brush,
    Eraser,
    Bucket,
    Fill,
  }

  let canvas: HTMLCanvasElement;

  let selectedTool: ToolKind = ToolKind.Brush;
  let color = "#000000";
  let size = 1;

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

    const ctx = node.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, node.width, node.height);

    function onPointerDown(event: PointerEvent) {
      const { x, y } = getScaleAdjustedCoordinates(node, event);

      if (selectedTool === ToolKind.Brush || selectedTool === ToolKind.Eraser) {
        node.addEventListener("pointermove", onPointerMove);
        node.addEventListener("pointerup", onPointerUp);
        node.addEventListener("pointerleave", onPointerLeave);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = selectedTool === ToolKind.Brush ? color : "#ffffff";
        ctx.lineWidth = size;

        beginNewEvent({
          kind: DrawingEventKind.Start,
          sequence: [{ x, y }],
          size,
          color: selectedTool === ToolKind.Brush ? color : "#ffffff",
        });
      } else if (ToolKind.Fill) {
        floodFillCanvas(canvas, x, y, color);

        updateDrawing(socket, { kind: DrawingEventKind.Fill, x, y, color });
      }
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

  function handleClear() {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateDrawing(socket, { kind: DrawingEventKind.Clear });
  }
</script>

<div class="relative flex flex-col h-full">
  <Clue phase={game.phase} clue={game.clue} secret={game.secret} artist={game.artist} {userId} />
  <canvas
    class="h-[89%] bg-white aspect-square cursor-cell"
    width="512"
    height="512"
    use:drawableCanvas
    bind:this={canvas}
  />
  <div class="w-full bg-zinc-800 flex justify-between items-center p-3" style="height: 5%;">
    <div class="flex items-center gap-1">
      <ResetDrawingButton on:click={handleClear} />

      <BrushButton
        selected={selectedTool === ToolKind.Brush}
        callback={() => (selectedTool = ToolKind.Brush)}
      />

      <EraserButton
        selected={selectedTool === ToolKind.Eraser}
        callback={() => (selectedTool = ToolKind.Eraser)}
      />

      <FillButton
        selected={selectedTool === ToolKind.Fill}
        callback={() => (selectedTool = ToolKind.Fill)}
      />
    </div>

    <div class="flex items-center gap-3">
      {#if selectedTool === ToolKind.Brush || selectedTool === ToolKind.Eraser}
        <BrushSizeSelector bind:size />
      {/if}
      {#if selectedTool === ToolKind.Brush || selectedTool === ToolKind.Fill}
        <ColorPicker bind:selectedColor={color} />
      {/if}
    </div>
  </div>

  {#if game.phase === GamePhase.Drawing}
    <GameTimer {...game} />
  {/if}

  {#if game.phase !== GamePhase.Drawing}
    <CanvasOverlay {game} {userId} {socket} />
  {/if}
</div>
