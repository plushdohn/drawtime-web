import {
  ClientEventKind,
  DrawingUpdateKind,
  ServerEventKind,
  type DrawingUpdateEvent,
} from "$lib/logic/shared";
import { registerListenerToSpecificSocketEvent, sendClientEvent } from "./socket";

type DrawingUpdate = {
  kind: DrawingUpdateKind;
  x: number;
  y: number;
  size: number;
  color: string;
};

export function subscribeToDrawingUpdates(listener: (update: DrawingUpdate) => any) {
  return registerListenerToSpecificSocketEvent<DrawingUpdateEvent>(
    ServerEventKind.DRAWING_UPDATE,
    (payload) => {
      const [kind, x, y, size, color] = payload;

      listener({
        kind,
        x,
        y,
        size,
        color,
      });
    }
  );
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
