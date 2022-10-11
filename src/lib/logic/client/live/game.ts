import { GamePhase, type GameState } from "$lib/logic/shared-types";
import type { ExtendedSocket } from "./types";

export function subscribeToGameUpdates(
  socket: ExtendedSocket,
  updater: (fn: (s: GameState) => GameState) => void
) {
  socket.on("playerJoined", (playerInfo) => {
    updater((s) => {
      if (s.players.find((p) => p.id === playerInfo.id)) {
        return {
          ...s,
          players: s.players.map((p) => {
            if (p.id === playerInfo.id) {
              return {
                ...p,
                disconnected: false,
              };
            }

            return p;
          }),
        };
      } else {
        return {
          ...s,
          players: [
            ...s.players,
            { ...playerInfo, score: 0, guessIndex: null, disconnected: false },
          ],
        };
      }
    });
  });

  socket.on("playerLeft", (playerId) =>
    updater((s) => ({
      ...s,
      players: s.players.map((p) => {
        if (p.id === playerId) return { ...p, disconnected: true };
        return p;
      }),
    }))
  );

  socket.on("roundStarted", (round, artist, choices) => {
    updater((s) => ({
      ...s,
      phase: GamePhase.Choosing,
      currentRound: round,
      artist,
      choices: choices ? choices : null,
      players: s.players.map((p) => ({ ...p, guessIndex: null })),
    }));
  });

  socket.on("drawingStarted", (clue, secret) => {
    updater((s) => ({
      ...s,
      phase: GamePhase.Drawing,
      clue,
      secret,
    }));
  });

  socket.on("correctGuess", (playerId, guessIndex, points) => {
    updater((s) => ({
      ...s,
      players: s.players.map((p) => {
        if (p.id === playerId) {
          return {
            ...p,
            guessIndex,
            score: (p.score ?? 0) + points,
          };
        } else if (guessIndex === 0 && p.id === s.artist) {
          return {
            ...p,
            score: (p.score ?? 0) + points,
          };
        }

        return p;
      }),
    }));
  });

  socket.on("clueUpdated", (clue) => {
    updater((s) => ({
      ...s,
      clue,
    }));
  });

  socket.on("roundEnded", (secret) => {
    updater((s) => ({ ...s, phase: GamePhase.Transitioning, secret }));
  });

  socket.on("gameEnded", () => {
    updater((s) => ({ ...s, phase: GamePhase.Ended }));
  });

  return () => {
    socket.off("playerJoined");
    socket.off("playerLeft");
    socket.off("roundStarted");
    socket.off("drawingStarted");
    socket.off("correctGuess");
    socket.off("clueUpdated");
    socket.off("roundEnded");
    socket.off("gameEnded");
  };
}

export function createGame(
  socket: ExtendedSocket,
  params: {
    topicId: string;
    drawingTime: number;
    rounds: number;
  }
) {
  return new Promise<string>((resolve, reject) => {
    socket.emit(
      "createGame",
      {
        topicId: params.topicId,
        drawingTime: params.drawingTime,
        rounds: params.rounds,
      },
      (response) => {
        console.log(response);
        if ("error" in response) reject(new Error(response.error));
        else resolve(response.body);
      }
    );
  });
}

export function joinGame(socket: ExtendedSocket, gameId: string) {
  return new Promise<GameState>((resolve, reject) => {
    socket.emit("joinGame", gameId, (response) => {
      if ("error" in response) reject(new Error(response.error));
      else resolve(response.body);
    });
  });
}

export function startGame(socket: ExtendedSocket) {
  socket.emit("startGame");
}

export function chooseWord(socket: ExtendedSocket, choice: string) {
  socket.emit("chooseWord", choice);
}

export function guess(socket: ExtendedSocket, guess: string) {
  socket.emit("guess", guess);
}
