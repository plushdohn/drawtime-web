import { PUBLIC_GAMESERVER_URL } from "$env/static/public";
import { io, type Socket } from "socket.io-client";
import { writable } from "svelte/store";
import type { ExtendedSocket } from "./types";

type GameServerConnectionStore = {
  pending: boolean;
  socket: ExtendedSocket | null;
  error: string | null;
};

export const gameServerConnectionStore = writable<GameServerConnectionStore>({
  pending: false,
  socket: null,
  error: null,
});

export const connectToGameServer = (authToken: string) => {
  return new Promise<Socket>((resolve, reject) => {
    const sock = io(PUBLIC_GAMESERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 1,
      transports: ["websocket"],
      query: {
        token: authToken,
      },
    });

    gameServerConnectionStore.set({
      pending: true,
      error: null,
      socket: null,
    });

    sock.on("connect", () => {
      gameServerConnectionStore.set({
        pending: false,
        error: null,
        socket: sock,
      });

      resolve(sock);
    });

    sock.on("disconnect", (reason) => {
      gameServerConnectionStore.set({
        pending: false,
        error: "Socket was closed",
        socket: null,
      });

      console.log("DISCONNECTED DUE TO REASON:" + reason);

      reject(new Error("Couldn't reach game servers"));
    });

    sock.on("connect_error", (err) => {
      gameServerConnectionStore.set({
        pending: false,
        error: "Socket encountered an error",
        socket: null,
      });

      console.log(err);
      reject(new Error("Couldn't reach game servers"));
    });
  });
};
