import { PUBLIC_GAMESERVER_URL } from "$env/static/public";
import { io } from "socket.io-client";
import { get, writable } from "svelte/store";
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

export const connectToGameServer = (
  params: { userId: string; authToken: string } | { guestUsername: string; captchaToken: string }
) => {
  return new Promise<ExtendedSocket>((resolve, reject) => {
    const storeValues = get(gameServerConnectionStore);

    gameServerConnectionStore.set({
      pending: true,
      error: null,
      socket: null,
    });

    let sock: ExtendedSocket;

    if (storeValues.socket !== null) {
      storeValues.socket.disconnect().connect();

      sock = storeValues.socket;
    } else {
      sock = io(PUBLIC_GAMESERVER_URL, {
        transports: ["websocket"],
        reconnection: false,
        auth:
          "authToken" in params
            ? { id: params.userId, token: params.authToken }
            : {
                id: crypto.randomUUID(),
                username: params.guestUsername,
                captchaToken: params.captchaToken,
              },
      }) as ExtendedSocket;
    }

    sock.once("connect", () => {
      gameServerConnectionStore.set({
        pending: false,
        error: null,
        socket: sock,
      });

      resolve(sock);
    });

    sock.once("connect_error", (err) => {
      console.log("CONNECT ERROR:" + err);

      gameServerConnectionStore.set({
        pending: false,
        error: "Server refused the connection",
        socket: null,
      });

      reject(new Error("Couldn't reach game servers"));
    });

    sock.once("disconnect", (reason) => {
      console.log("DISCONNECTED DUE TO REASON:" + reason);

      gameServerConnectionStore.set({
        pending: false,
        error: reason,
        socket: sock,
      });
    });
  });
};
