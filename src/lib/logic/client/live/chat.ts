import { ClientEventKind, ServerEventKind } from "$lib/logic/shared";
import { registerSocketEventsListener, sendClientEvent } from "./socket";

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

export function subscribeToChatEvents(listener: (chatEvent: AnyChatEvent) => any) {
  return registerSocketEventsListener((event) => {
    if (event.kind === ServerEventKind.CHAT_MESSAGE) {
      const [senderId, contents] = event.payload;

      listener({
        kind: ChatEventKind.MESSAGE,
        payload: {
          senderId,
          contents,
        },
      });
    } else if (event.kind === ServerEventKind.CORRECT_GUESS) {
      const [playerId] = event.payload;

      listener({
        kind: ChatEventKind.CORRECT_GUESS,
        payload: playerId,
      });
    }
  });
}

export function sendChatMessage(socket: WebSocket, message: string) {
  sendClientEvent(socket, {
    kind: ClientEventKind.SEND_CHAT_MESSAGE,
    payload: [message],
  });
}
