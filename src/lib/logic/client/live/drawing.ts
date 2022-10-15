import type { AnyDrawingEvent } from "$lib/logic/shared-types";
import type { ExtendedSocket } from "./types";

export function updateDrawing(socket: ExtendedSocket, update: AnyDrawingEvent) {
  socket.volatile.emit("updateDrawing", update);
}

export function subscribeToDrawingUpdates(
  socket: ExtendedSocket,
  listener: (u: AnyDrawingEvent) => void
) {
  function handleDrawingUpdate(update: AnyDrawingEvent) {
    listener(update);
  }

  socket.on("drawingUpdate", handleDrawingUpdate);

  return () => socket.off("drawingUpdate", handleDrawingUpdate);
}
