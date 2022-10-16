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
      transports: ["websocket"],
      reconnection: false,
      reconnectionAttempts: 5,
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
      // After connecting, we add a "reconnect" query
      // flag to the socket, so that the server knows
      // we are reconnecting when we open the socket
      // again, and can reassign us to the same room.
      sock.io.opts.query = {
        token: authToken,
        reconnect: true,
      };

      // Enable auto-reconnection only after we
      // successfully connected once.
      sock.io.reconnection(true);

      gameServerConnectionStore.set({
        pending: false,
        error: null,
        socket: sock,
      });

      resolve(sock);
    });

    sock.on("connect_error", (err) => {
      if (err.message === "refused") {
        sock.disconnect();

        gameServerConnectionStore.set({
          pending: false,
          error: "Server refused the connection",
          socket: null,
        });
      }

      reject(new Error("Couldn't reach game servers"));
    });

    sock.on("disconnect", (reason) => {
      console.log("DISCONNECTED DUE TO REASON:" + reason);

      gameServerConnectionStore.set({
        pending: true,
        error: reason,
        socket: sock,
      });
    });

    sock.io.on("reconnect_failed", () => {
      gameServerConnectionStore.set({
        pending: false,
        error: "Reconnection timed out",
        socket: null,
      });
    });
  });
};
