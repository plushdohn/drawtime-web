import { ClientEventKind } from "$lib/logic/shared";
import { sendClientEvent } from "./socket";

type DrawingUpdate = {
  kind: DrawingUpdateKind;
  x: number;
  y: number;
  size: number;
  color: string;
};

type Listener = (data: DrawingUpdate) => void;

export enum DrawingUpdateKind {
  START,
  CONTINUE,
}

let listener: Listener | null = null;

export function onDrawingUpdate(
  kindAsNumber: number,
  x: number,
  y: number,
  size: number,
  color: string
) {
  if (listener !== null) {
    listener({
      kind: kindAsNumber === 1 ? DrawingUpdateKind.CONTINUE : DrawingUpdateKind.START,
      x,
      y,
      size,
      color,
    });
  }
}

export function subscribeToDrawingUpdates(callback: Listener) {
  listener = callback;

  return () => (listener = null);
}

export function updateDrawing(
  socket: WebSocket,
  update: {
    kind: DrawingUpdateKind;
    x: number;
    y: number;
    size: number;
    color: string;
  }
) {
  sendClientEvent(socket, {
    kind: ClientEventKind.UPDATE_DRAWING,
    payload: [
      update.kind === DrawingUpdateKind.CONTINUE ? 1 : 0,
      update.x,
      update.y,
      update.size,
      update.color,
    ],
  });
}
