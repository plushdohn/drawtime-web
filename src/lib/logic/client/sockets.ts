import { writable } from "svelte/store";
import { resolveAsyncCallback } from "./async-sockets";
import { ServerEvent, type ServerEventSignatures } from "$lib/logic/shared";
import { PUBLIC_GAMESERVER_URL } from "$env/static/public";

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
  gameServerConnectionStore.update((s) => ({
    ...s,
    pending: true,
    error: null,
    socket: null,
  }));

  const sock = new WebSocket(`${PUBLIC_GAMESERVER_URL}/?token=${authToken}`);

  return new Promise<WebSocket>((resolve, reject) => {
    sock.onopen = () => {
      gameServerConnectionStore.set({
        pending: false,
        error: null,
        socket: sock,
      });

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
      const message = e.data as string;
      const separatorIndex = message.indexOf("|");
      const command = message.substring(0, separatorIndex) as ServerEvent;
      const args = message.substring(separatorIndex + 1).split("|");

      if (command === ServerEvent.ASYNC_RESPONSE) {
        const [asyncId, payload] = args;

        resolveAsyncCallback(asyncId, payload);
      } else {
        for (const sub of socketSubscribers) {
          sub([command, args as any]);
        }
      }
    };
  });
};

let socketSubscribers: ((
  payload: {
    [K in ServerEvent]: [command: K, args: ServerEventSignatures[K]];
  }[ServerEvent]
) => void)[] = [];

export const subscribeToSocketEvents = (
  listener: (
    payload: {
      [K in ServerEvent]: [command: K, args: ServerEventSignatures[K]];
    }[ServerEvent]
  ) => void
) => {
  socketSubscribers.push(listener);

  return () => {
    socketSubscribers = socketSubscribers.filter((s) => s !== listener);
  };
};
