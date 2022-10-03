import { PUBLIC_GAMESERVER_URL } from "$env/static/public";
import { writable } from "svelte/store";
import { handleAsyncResponse } from "./async";
import { decodeEvent, encodeEvent } from "./dan";
import { onDrawingUpdate } from "./drawing";
import {
  onClueUpdate,
  onCorrectGuess,
  onDrawingStarted,
  onGameEnded,
  onPlayerJoined,
  onPlayerLeft,
  onRoundEnded,
  onRoundStarted,
} from "./game";
import { ServerEventKind, type AnyClientEvent, type AnyServerEvent } from "$lib/logic/shared";

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
      console.log("RECEIVED SOCKET EVENT:");
      console.log(e.data);
      handleMessage(e.data);
    };
  });
};

export function sendClientEvent(socket: WebSocket, event: AnyClientEvent) {
  const encoded = encodeEvent(event.kind, event.payload);
  socket.send(encoded);

  console.log("FIRED SOCKET EVENT:");
  console.log(encoded);
}

function handleMessage(message: string) {
  const data = decodeEvent(message) as AnyServerEvent;

  switch (data.kind) {
    case ServerEventKind.ASYNC_RESPONSE:
      return handleAsyncResponse(...data.payload);
    case ServerEventKind.PLAYER_JOINED:
      return onPlayerJoined(...data.payload);
    case ServerEventKind.PLAYER_LEFT:
      return onPlayerLeft(...data.payload);
    case ServerEventKind.ROUND_STARTED:
      return onRoundStarted(...data.payload);
    case ServerEventKind.DRAWING_STARTED:
      return onDrawingStarted(...data.payload);
    case ServerEventKind.CORRECT_GUESS:
      return onCorrectGuess(...data.payload);
    case ServerEventKind.CLUE_UPDATE:
      return onClueUpdate(...data.payload);
    case ServerEventKind.ROUND_ENDED:
      return onRoundEnded(...data.payload);
    case ServerEventKind.GAME_ENDED:
      return onGameEnded(...data.payload);
    case ServerEventKind.DRAWING_UPDATE:
      return onDrawingUpdate(...data.payload);
    case ServerEventKind.CHAT_MESSAGE:
      return;
  }

  const _exhaustiveCheck: never = data;
}
