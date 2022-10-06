import {
  ClientEventKind,
  ServerEventKind,
  type AnyDrawingEvent,
  type DrawingUpdateEvent,
} from "$lib/logic/shared";
import { registerListenerToSpecificSocketEvent, sendClientEvent } from "./socket";

export function subscribeToDrawingUpdates(listener: (event: AnyDrawingEvent) => any) {
  return registerListenerToSpecificSocketEvent<DrawingUpdateEvent>(
    ServerEventKind.DRAWING_UPDATE,
    (payload) => {
      listener(payload);
    }
  );
}

export function updateDrawing<T extends AnyDrawingEvent>(socket: WebSocket, event: T) {
  sendClientEvent(socket, {
    kind: ClientEventKind.UPDATE_DRAWING,
    payload: event,
  });
}
