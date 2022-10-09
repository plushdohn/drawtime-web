import type { ExtendedSocket } from "./types";

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

export function subscribeToChatEvents(
  socket: ExtendedSocket,
  listener: (chatEvent: AnyChatEvent) => any
) {
  function handleChatMessage(senderId: string, contents: string) {
    listener({
      kind: ChatEventKind.MESSAGE,
      payload: {
        senderId,
        contents,
      },
    });
  }

  function handleCorrectGuess(playerId: string) {
    listener({
      kind: ChatEventKind.CORRECT_GUESS,
      payload: playerId,
    });
  }

  socket.on("chatMessage", handleChatMessage);
  socket.on("correctGuess", handleCorrectGuess);

  return () => {
    socket.off("chatMessage", handleChatMessage);
    socket.off("correctGuess", handleCorrectGuess);
  };
}

export function sendChatMessage(socket: ExtendedSocket, message: string) {
  socket.emit("sendMessage", message);
}
