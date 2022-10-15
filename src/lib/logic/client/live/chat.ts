import type { ExtendedSocket } from "./types";

export enum ChatEventKind {
  MESSAGE = "MESSAGE",
  CORRECT_GUESS = "CORRECT_GUESS",
  ROUND_STARTED = "ROUND_STARTED",
  PLAYER_JOINED = "PLAYER_JOINED",
  PLAYER_LEFT = "PLAYER_LEFT",
  CLOSE_GUESS = "CLOSE_GUESS",
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

type RoundStarting = {
  kind: ChatEventKind.ROUND_STARTED;
  payload: string;
};

export type AnyChatEvent = ChatMessage | CorrectGuess | RoundStarting;

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

  function handleRoundStarting(round: number, artistId: string) {
    listener({
      kind: ChatEventKind.ROUND_STARTED,
      payload: artistId,
    });
  }

  socket.on("chatMessage", handleChatMessage);
  socket.on("correctGuess", handleCorrectGuess);
  socket.on("roundStarted", handleRoundStarting);

  return () => {
    socket.off("chatMessage", handleChatMessage);
    socket.off("correctGuess", handleCorrectGuess);
    socket.off("roundStarted", handleRoundStarting);
  };
}

export function sendChatMessage(socket: ExtendedSocket, message: string) {
  socket.emit("sendMessage", message);
}
