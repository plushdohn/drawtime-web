import { ClientEventKind } from "$lib/logic/shared";
import { sendClientEvent } from "./socket";

export enum ChatEventKind {
  MESSAGE = "MESSAGE",
  CORRECT_GUESS = "CORRECT_GUESS",
}

type ChatMessage = {
  kind: ChatEventKind.MESSAGE;
  payload: {
    senderId: string;
    contents: string;
  };
};

type CorrectGuess = {
  kind: ChatEventKind.CORRECT_GUESS;
  payload: string;
};

export type AnyChatEvent = ChatMessage | CorrectGuess;

type Listener = (data: AnyChatEvent) => void;

let listener: Listener | null = null;

export function subscribeToChatEvents(callback: Listener) {
  listener = callback;

  return () => (listener = null);
}

export function onChatMessage(senderId: string, contents: string) {
  if (listener !== null)
    listener({
      kind: ChatEventKind.MESSAGE,
      payload: {
        senderId,
        contents,
      },
    });
}

export function sendChatMessage(socket: WebSocket, message: string) {
  sendClientEvent(socket, {
    kind: ClientEventKind.SEND_CHAT_MESSAGE,
    payload: [message],
  });
}

export function onCorrectGuess(playerId: string) {
  if (listener !== null) listener({ kind: ChatEventKind.CORRECT_GUESS, payload: playerId });
}
