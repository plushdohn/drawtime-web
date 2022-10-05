import { ServerEventKind, type AnyClientEvent, type AsyncResponseEvent } from "$lib/logic/shared";
import { registerListenerToSpecificSocketEvent, sendClientEvent } from "./socket";

type Response<T> = { error: string } | { body: T };
type Subscriber<T> = (r: Response<T>) => void;

let subscribers: Map<string, Subscriber<any>> = new Map();

export function sendAsyncEvent<T>(socket: WebSocket, asyncId: string, event: AnyClientEvent) {
  return new Promise<T>((resolve, reject) => {
    expectAsyncCallback<T>(asyncId, (response) => {
      if ("error" in response) {
        reject(new Error(response.error));
      } else {
        resolve(response.body);
      }
    });

    sendClientEvent(socket, event);
  });
}
let socketEventListener: (() => void) | null = null;

function expectAsyncCallback<T>(asyncId: string, callback: Subscriber<T>) {
  if (socketEventListener === null) {
    socketEventListener = registerListenerToSpecificSocketEvent<AsyncResponseEvent>(
      ServerEventKind.ASYNC_RESPONSE,
      ([asyncId, json]) => {
        const response = JSON.parse(json) as Response<any>;

        const callback = subscribers.get(asyncId);

        if (!callback) {
          return console.error("Server responded to an async callback that doesn't exist");
        }

        callback(response);

        subscribers.delete(asyncId);

        if (subscribers.size === 0 && socketEventListener) {
          socketEventListener();

          socketEventListener = null;
        }
      }
    );
  }

  subscribers.set(asyncId, callback);
}

export function generateAsyncId() {
  return Math.floor(Math.random() * 999).toString();
}
