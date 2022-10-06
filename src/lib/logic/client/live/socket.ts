import { PUBLIC_GAMESERVER_URL } from "$env/static/public";
import { writable } from "svelte/store";
import type { AnyClientEvent, AnyServerEvent } from "$lib/logic/shared";

type GameServerConnectionStore = {
  pending: boolean;
  socket: WebSocket | null;
  error: string | null;
};

export const gameServerConnectionStore = writable<GameServerConnectionStore>({
  pending: false,
  socket: null,
  error: null,
});

export const connectToGameServer = (authToken: string) => {
  gameServerConnectionStore.set({
    pending: true,
    error: null,
    socket: null,
  });

  const sock = new WebSocket(`${PUBLIC_GAMESERVER_URL}/?token=${authToken}`);

  return new Promise<WebSocket>((resolve, reject) => {
    sock.onopen = () => {
      gameServerConnectionStore.set({
        pending: false,
        error: null,
        socket: sock,
      });

      heartbeat(sock);

      resolve(sock);
    };

    sock.onerror = () => {
      sock.close();

      gameServerConnectionStore.set({
        pending: false,
        error: "Socket encountered an error",
        socket: null,
      });

      reject(new Error("Couldn't reach game servers"));
    };

    sock.onmessage = (e: MessageEvent) => {
      if (e.data === "ping") {
        heartbeat(sock);
        return sock.send("pong");
      }

      console.log("RECEIVED SOCKET EVENT:");
      console.log(e.data);
      handleMessage(e.data);
    };

    sock.onclose = () => {
      console.log("SOCKET CONNECTION CLOSED");

      gameServerConnectionStore.set({
        pending: false,
        error: "Socket closed",
        socket: null,
      });

      if (heartbeatTimeout !== null) clearTimeout(heartbeatTimeout);
    };
  });
};

export function sendClientEvent(socket: WebSocket, event: AnyClientEvent) {
  const encoded = JSON.stringify(event);
  socket.send(encoded);

  console.log("FIRED SOCKET EVENT:");
  console.log(encoded);
}

type SocketListener = (event: AnyServerEvent) => any;

let socketListeners: Set<SocketListener> = new Set();

export function registerSocketEventsListener(listener: SocketListener) {
  socketListeners.add(listener);

  return () => {
    socketListeners.delete(listener);
  };
}

export function registerListenerToSpecificSocketEvent<T extends AnyServerEvent>(
  event: T["kind"],
  listener: (payload: T["payload"]) => any
) {
  return registerSocketEventsListener((e) => {
    if (e.kind === event) {
      listener(e.payload);
    }
  });
}

function handleMessage(message: string) {
  const data = JSON.parse(message) as AnyServerEvent;

  socketListeners.forEach((listener) => listener(data));
}

let heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;

function heartbeat(socket: WebSocket) {
  if (heartbeatTimeout !== null) clearTimeout(heartbeatTimeout);

  heartbeatTimeout = setTimeout(() => {
    console.log("NO RESPONSE TO HEARTBEAT, CLOSING SOCKET");
    socket.close();
  }, 30000 + 1000);
}
