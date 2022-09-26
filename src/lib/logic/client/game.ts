import type { Writable } from "svelte/store";
import {
  ClientEvent,
  DrawingUpdateKind,
  GamePhase,
  ServerEvent,
  type ServerEventSignatures,
  type GameState,
} from "$lib/logic/shared";
import {
  createAsyncCallback,
  type AsyncCallbackPayload,
} from "./async-sockets";
import { subscribeToSocketEvents } from "./sockets";

export const createGame = (
  socket: WebSocket,
  params: {
    topicId: string;
    drawingTime: number;
    rounds: number;
  }
) => {
  return new Promise<string>((resolve, reject) => {
    const asyncId = createAsyncCallback(
      (payload: AsyncCallbackPayload<{ id: string }>) => {
        if ("error" in payload) return reject(new Error(payload.error));

        return resolve(payload.id);
      }
    );

    socket.send(
      `${ClientEvent.CREATE_GAME}|${asyncId}|${params.topicId}|${params.drawingTime}|${params.rounds}`
    );
  });
};

export const joinGame = (socket: WebSocket, gameId: string) => {
  return new Promise<GameState>((resolve, reject) => {
    const asyncId = createAsyncCallback(
      (payload: AsyncCallbackPayload<{ game: GameState }>) => {
        if ("error" in payload) return reject(new Error(payload.error));

        return resolve(payload.game);
      }
    );

    socket.send(`${ClientEvent.JOIN_GAME}|${asyncId}|${gameId}`);
  });
};

export const startGame = (socket: WebSocket) => {
  socket.send(`${ClientEvent.START_GAME}`);
};

export const chooseWord = (socket: WebSocket, word: string) => {
  socket.send(`${ClientEvent.CHOOSE_WORD}|${word}`);
};

export const guess = (socket: WebSocket, guess: string) => {
  socket.send(`${ClientEvent.MAKE_GUESS}|${guess}`);
};

export const sendChatMessage = (socket: WebSocket, message: string) => {
  socket.send(`${ClientEvent.CHAT_MESSAGE}|${message}`);
};

export const sendDrawingUpdate = (
  socket: WebSocket,
  update: [
    kind: DrawingUpdateKind,
    x: number,
    y: number,
    size: number,
    color: string
  ]
) => {
  socket.send(`${ClientEvent.DRAWING_UPDATE}|${update.join("|")}`);
};

export const subscribeStoreToGameUpdates = (store: Writable<GameState>) => {
  const handler = ([command, args]: {
    [K in ServerEvent]: [command: K, args: ServerEventSignatures[K]];
  }[ServerEvent]) => {
    console.log(command, args);
    if (command === ServerEvent.PLAYER_JOINED) {
      const [playerId, playerName, playerAvatarUrl] = args;

      store.update((s) => ({
        ...s,
        players: [
          ...s.players,
          {
            id: playerId,
            username: playerName,
            avatarUrl: playerAvatarUrl,
            score: null,
            guessIndex: null,
          },
        ],
      }));
    } else if (command === ServerEvent.PLAYER_LEFT) {
      const [playerId] = args as ServerEventSignatures[ServerEvent.PLAYER_LEFT];

      store.update((s) => ({
        ...s,
        players: s.players.filter((p) => p.id !== playerId),
      }));
    } else if (command === ServerEvent.ROUND_STARTED) {
      const [artistId, round, choices] =
        args as ServerEventSignatures[ServerEvent.ROUND_STARTED];

      store.update((s) => ({
        ...s,
        artist: artistId,
        currentRound: parseInt(round),
        phase: GamePhase.Choosing,
        players: s.players.map((p) => {
          if (p.score === null) {
            return { ...p, score: 0 };
          }

          return p;
        }),
        ...(choices ? { choices: choices.split(",") } : {}),
      }));
    } else if (command === ServerEvent.DRAWING_STARTED) {
      const [clue, secret] =
        args as ServerEventSignatures[ServerEvent.DRAWING_STARTED];

      store.update((s) => ({
        ...s,
        phase: GamePhase.Drawing,
        clue,
        ...(secret ? { secret } : {}),
      }));
    } else if (command === ServerEvent.CORRECT_GUESS) {
      const [playerId, guessIndex, newScore] =
        args as ServerEventSignatures[ServerEvent.CORRECT_GUESS];

      store.update((s) => ({
        ...s,
        players: s.players.map((p) => {
          if (p.id !== playerId) return p;

          return {
            ...p,
            score: parseInt(newScore),
            guess: parseInt(guessIndex),
          };
        }),
      }));
    } else if (command === ServerEvent.ROUND_ENDED) {
      const [secret] = args as ServerEventSignatures[ServerEvent.ROUND_ENDED];

      store.update((s) => ({
        ...s,
        phase: GamePhase.Transitioning,
        secret,
      }));
    } else if (command === ServerEvent.GAME_ENDED) {
      store.update((s) => ({
        ...s,
        phase: GamePhase.Ended,
      }));
    }
  };

  const unsub = subscribeToSocketEvents(handler);

  return unsub;
};
