import { z } from "zod";

export const guestUsernameSchema = z
  .string()
  .min(4, "Must have at least 4 characters.")
  .max(32, "Can't be longer than 32 characters.");

export const gameCreationSchema = z.object({
  drawingTime: z.number().min(10).max(90),
  rounds: z.number().min(1).max(10),
});

/**
 * Topic schema, used for form validation on the client
 * and topic validation on the server before adding
 * to DB
 */
export function createTopicSchema(subscriber?: boolean) {
  return z.object({
    name: z
      .string()
      .min(5, "Must contain at least 5 characters")
      .max(64, "Can't be longer than 64 characters"),
    nsfw: z.boolean(),
    unlisted: z.boolean(),
    thumbnail: z.string({
      invalid_type_error: "A thumbnail is required",
      required_error: "A thumbnail is required",
    }),
    words: z
      .array(
        z
          .string()
          .min(2, "Words need at least 2 characters")
          .max(32, "Words can't have more than 32 characters")
      )
      .min(5, "At least 5 words are required")
      .max(subscriber ? 1024 : 256, "Word limit reached")
      .superRefine((arr, ctx) => {
        const duplicates = Array.from(arr.keys()).filter((i) => {
          const item = arr[i];

          return arr.indexOf(item) !== arr.lastIndexOf(item);
        });

        for (const d of duplicates) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Word appears multiple times",
            path: [d],
          });

          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Word list contains duplicate word "${arr[d]}"`,
            path: [],
          });
        }
      }),
  });
}

/**
 * Socket events
 */

export interface ClientToServerEvents {
  createGame: (
    params: {
      topicId: string;
      drawingTime: number;
      rounds: number;
    },
    callback: (p: AsyncResponse<string>) => void
  ) => void;
  joinGame: (gameId: string, callback: (p: AsyncResponse<GameState>) => void) => void;
  startGame: () => void;
  chooseWord: (choice: string) => void;
  guess: (
    guess: string,
    callback: (p: AsyncResponse<{ close: boolean } | { success: boolean }>) => void
  ) => void;
  sendMessage: (contents: string) => void;
  updateDrawing: (update: AnyDrawingEvent) => void;
}

export interface ServerToClientEvents {
  playerJoined: (playerInfo: { id: string; username: string; avatarUrl: string | null }) => void;
  playerLeft: (playerId: string) => void;
  chatMessage: (senderId: string, contents: string) => void;
  roundStarted: (round: number, artist: string, choices: string[] | null) => void;
  drawingStarted: (clue: string, secret: string | null) => void;
  clueUpdated: (newClue: string) => void;
  correctGuess: (playerId: string, guessIndex: number, points: number) => void;
  roundEnded: (secret: string) => void;
  gameEnded: () => void;
  drawingUpdate: (update: AnyDrawingEvent) => void;
}

/**
 * DB TYPES
 */

export const enum GamePhase {
  Waiting = "WAITING",
  Choosing = "CHOOSING",
  Drawing = "DRAWING",
  Transitioning = "TRANSITIONING",
  Ended = "Ended",
}

export type ProfileModel = {
  id: string;
  username: string;
  avatarUrl: string | null;
  moderator: boolean;
  subscriber: boolean;
};

export type TopicModel = {
  id: string;
  name: string;
  plays: number;
  unlisted: boolean;
  general: boolean;
  nsfw: boolean;
  creator: string;
  createdAt: string;
};

export type WordModel = {
  topic: string;
  word: string;
};

export type GameModel = {
  id: string;
  topic: string;
  drawingTime: number;
  maxRounds: number;
  currentRound: number;
  owner: string;
  artist: string;
  phase: GamePhase;
  choices: string[] | null;
  secret: string | null;
  clue: string | null;
  is_private: boolean;
};

export type PlayerModel = {
  id: string;
  game: string;
  username: string;
  avatarUrl: string | null;
  score: number | null;
  guessIndex: number | null;
  disconnected: boolean;
};

// Game->players join query
export type GameState = GameModel & {
  players: Player[];
};

// PlayerModel but with the game's foreign key
// omitted
export type Player = Omit<PlayerModel, "game">;

// Topic->words join query
export type TopicWithWords = TopicModel & {
  words: string[];
};

// Topic->creator join query
export type TopicWithCreator = TopicModel & {
  creator: ProfileModel;
};

/**
 * Drawing events
 */

export enum DrawingEventKind {
  Start,
  Continue,
  Clear,
}

export type DrawingStartEvent = {
  kind: DrawingEventKind.Start;
  sequence: { x: number; y: number }[];
  size: number;
  color: string;
};

export type DrawingContinueEvent = {
  kind: DrawingEventKind.Continue;
  sequence: { x: number; y: number }[];
};

export type DrawingClearEvent = {
  kind: DrawingEventKind.Clear;
};

export type AnyDrawingEvent = DrawingStartEvent | DrawingContinueEvent | DrawingClearEvent;

/**
 * Utility types
 */
type AsyncResponse<T> = { body: T } | { error: string };
