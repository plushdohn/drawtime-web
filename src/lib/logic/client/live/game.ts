import { ClientEventKind, GamePhase, type GameState } from "$lib/logic/shared";
import { generateAsyncId, sendAsyncEvent } from "./async";
import { sendClientEvent } from "./socket";

type Listener = (updater: (s: GameState) => GameState) => void;

let listener: Listener | null = null;

export function subscribeToGameUpdates(callback: Listener) {
  listener = callback;

  return () => (listener = null);
}

function update(updater: (s: GameState) => GameState) {
  if (listener !== null) listener(updater);
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
    payload: [asyncId, params.topicId, params.drawingTime, params.rounds],
  });

  return gameId;
}

export async function joinGame(socket: WebSocket, gameId: string) {
  const asyncId = generateAsyncId();

  const game = await sendAsyncEvent<GameState>(socket, asyncId, {
    kind: ClientEventKind.JOIN_GAME,
    payload: [asyncId, gameId],
  });

  return game;
}

export function startGame(socket: WebSocket) {
  sendClientEvent(socket, { kind: ClientEventKind.START_GAME, payload: [] });
}

export function chooseWord(socket: WebSocket, choice: string) {
  sendClientEvent(socket, {
    kind: ClientEventKind.CHOOSE_WORD,
    payload: [choice],
  });
}

export function makeGuess(socket: WebSocket, guess: string) {
  sendClientEvent(socket, {
    kind: ClientEventKind.MAKE_GUESS,
    payload: [guess],
  });
}

/**
 * All functions from now on are called when
 * the related socket event is received from
 * the game server.
 */

export function onPlayerJoined(id: string, name: string, avatarUrl: string | null) {
  update((s) => ({
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
}

export function onPlayerLeft(id: string) {
  update((s) => ({
    ...s,
    players: s.players.filter((p) => p.id !== id),
  }));
}

export function onRoundStarted(artistId: string, round: number, choices: string | null) {
  update((s) => ({
    ...s,
    artist: artistId,
    currentRound: round,
    phase: GamePhase.Choosing,
    players: s.players.map((p) => {
      if (p.score === null) {
        return { ...p, score: 0 };
      }

      return p;
    }),
    ...(choices ? { choices: choices.split(",") } : {}),
  }));
}

export function onDrawingStarted(clue: string, secret: string | null) {
  update((s) => ({
    ...s,
    phase: GamePhase.Drawing,
    clue,
    ...(secret ? { secret } : {}),
  }));
}

export function onCorrectGuess(playerId: string, guessIndex: number, points: number) {
  update((s) => ({
    ...s,
    players: s.players.map((p) => {
      if (p.id !== playerId) return p;

      return {
        ...p,
        score: (p.score ?? 0) + points,
        guessIndex: guessIndex,
      };
    }),
  }));
}

export function onClueUpdate(newClue: string) {
  update((s) => ({ ...s, clue: newClue }));
}

export function onRoundEnded(secret: string) {
  update((s) => ({
    ...s,
    phase: GamePhase.Transitioning,
    secret,
  }));
}

export function onGameEnded() {
  update((s) => ({
    ...s,
    phase: GamePhase.Ended,
  }));
}
