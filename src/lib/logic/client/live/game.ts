import { ClientEventKind, GamePhase, ServerEventKind, type GameState } from "$lib/logic/shared";
import { generateAsyncId, sendAsyncEvent } from "./async";
import { registerSocketEventsListener, sendClientEvent } from "./socket";

type Listener = (updater: (s: GameState) => GameState) => void;

export function subscribeToGameUpdates(callback: Listener) {
  return registerSocketEventsListener((event) => {
    if (event.kind === ServerEventKind.PLAYER_JOINED) {
      const { id, name, avatarUrl } = event.payload;

      callback((s) => ({
        ...s,
        players: [
          ...s.players,
          {
            id,
            username: name,
            avatarUrl: avatarUrl,
            score: null,
            guessIndex: null,
          },
        ],
      }));
    } else if (event.kind === ServerEventKind.PLAYER_LEFT) {
      const { playerId } = event.payload;

      return callback((s) => ({
        ...s,
        players: s.players.filter((p) => p.id !== playerId),
      }));
    } else if (event.kind === ServerEventKind.ROUND_STARTED) {
      const { artistId, round, choices } = event.payload;

      callback((s) => ({
        ...s,
        artist: artistId,
        currentRound: round,
        phase: GamePhase.Choosing,
        players: s.players.map((p) => {
          if (p.score === null) {
            return { ...p, score: 0 };
          }

          return {
            ...p,
            guessIndex: null,
          };
        }),
        ...(choices ? { choices: choices.split(",") } : {}),
      }));
    } else if (event.kind === ServerEventKind.DRAWING_STARTED) {
      const { clue, secret } = event.payload;

      callback((s) => ({
        ...s,
        phase: GamePhase.Drawing,
        clue,
        ...(secret ? { secret } : {}),
      }));
    } else if (event.kind === ServerEventKind.CORRECT_GUESS) {
      const { playerId, guessIndex, points } = event.payload;

      callback((s) => ({
        ...s,
        players: s.players.map((p) => {
          if (p.id !== playerId) {
            /**
             * If this was the first guess of the round,
             * we also update artist's score
             **/
            if (guessIndex === 0 && p.id === s.artist) {
              return {
                ...p,
                score: (p.score ?? 0) + points,
              };
            }

            return p;
          }

          return {
            ...p,
            score: (p.score ?? 0) + points,
            guessIndex: guessIndex,
          };
        }),
      }));
    } else if (event.kind === ServerEventKind.CLUE_UPDATE) {
      const { newClue } = event.payload;
      callback((s) => ({ ...s, clue: newClue }));
    } else if (event.kind === ServerEventKind.ROUND_ENDED) {
      const { secret } = event.payload;

      callback((s) => ({
        ...s,
        phase: GamePhase.Transitioning,
        secret,
      }));
    } else if (event.kind === ServerEventKind.GAME_ENDED) {
      callback((s) => ({
        ...s,
        phase: GamePhase.Ended,
      }));
    }
  });
}

/**
 * Implement all the socket events we
 * can fire as the user from the browser
 */

export async function createGame(
  socket: WebSocket,
  params: {
    topicId: string;
    drawingTime: number;
    rounds: number;
  }
) {
  const asyncId = generateAsyncId();

  const gameId = await sendAsyncEvent<string>(socket, asyncId, {
    kind: ClientEventKind.CREATE_GAME,
    payload: {
      asyncId,
      topicId: params.topicId,
      drawingTime: params.drawingTime,
      rounds: params.rounds,
    },
  });

  return gameId;
}

export async function joinGame(socket: WebSocket, gameId: string) {
  const asyncId = generateAsyncId();

  const game = await sendAsyncEvent<GameState>(socket, asyncId, {
    kind: ClientEventKind.JOIN_GAME,
    payload: { asyncId, gameId },
  });

  return game;
}

export function startGame(socket: WebSocket) {
  sendClientEvent(socket, { kind: ClientEventKind.START_GAME, payload: undefined });
}

export function chooseWord(socket: WebSocket, choice: string) {
  sendClientEvent(socket, {
    kind: ClientEventKind.CHOOSE_WORD,
    payload: { choice },
  });
}

export function makeGuess(socket: WebSocket, guess: string) {
  sendClientEvent(socket, {
    kind: ClientEventKind.MAKE_GUESS,
    payload: { guess },
  });
}
