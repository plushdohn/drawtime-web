import { z } from "zod";

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
      .max(64, "Can't be more than 64 characters"),
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
 * Client-sent events
 */

export enum ClientEventKind {
  CREATE_GAME = "CREATE_GAME",
  JOIN_GAME = "JOIN_GAME",
  START_GAME = "START_GAME",
  CHOOSE_WORD = "CHOOSE_WORD",
  MAKE_GUESS = "MAKE_GUESS",
  UPDATE_DRAWING = "UPDATE_DRAWING",
  SEND_CHAT_MESSAGE = "SEND_CHAT_MESSAGE",
}

export type CreateGameEvent = GenericEvent<
  ClientEventKind.CREATE_GAME,
  [asyncId: string, topicId: string, drawingTime: number, rounds: number]
>;

export type JoinGameEvent = GenericEvent<
  ClientEventKind.JOIN_GAME,
  [asyncId: string, gameId: string]
>;

export type StartGameEvent = GenericEvent<ClientEventKind.START_GAME, []>;

export type ChooseWordEvent = GenericEvent<ClientEventKind.CHOOSE_WORD, [choice: string]>;

export type MakeGuessEvent = GenericEvent<ClientEventKind.MAKE_GUESS, [guess: string]>;

export type UpdateDrawingEvent = GenericEvent<
  ClientEventKind.UPDATE_DRAWING,
  [continueFlag: number, x: number, y: number, size: number, color: string]
>;

export type SendChatMessageEvent = GenericEvent<
  ClientEventKind.SEND_CHAT_MESSAGE,
  [message: string]
>;

export type AnyClientEvent =
  | CreateGameEvent
  | JoinGameEvent
  | StartGameEvent
  | ChooseWordEvent
  | MakeGuessEvent
  | SendChatMessageEvent
  | UpdateDrawingEvent;

/**
 * Server-sent events
 */

export enum ServerEventKind {
  ASYNC_RESPONSE = "ASYNC_RESPONSE",
  PLAYER_JOINED = "PLAYER_JOINED",
  PLAYER_LEFT = "PLAYER_LEFT",
  ROUND_STARTED = "ROUND_STARTED",
  DRAWING_STARTED = "DRAWING_STARTED",
  CORRECT_GUESS = "CORRECT_GUESS",
  ROUND_ENDED = "ROUND_ENDED",
  CHAT_MESSAGE = "CHAT_MESSAGE",
  DRAWING_UPDATE = "DRAWING_UPDATE",
  CLUE_UPDATE = "CLUE_UPDATE",
  GAME_ENDED = "GAME_ENDED",
}

export type AsyncResponseEvent = GenericEvent<
  ServerEventKind.ASYNC_RESPONSE,
  [asyncId: string, json: string]
>;

export type PlayerJoinedEvent = GenericEvent<
  ServerEventKind.PLAYER_JOINED,
  [id: string, name: string, avatarUrl: string | null]
>;

export type PlayerLeftEvent = GenericEvent<ServerEventKind.PLAYER_LEFT, [playerId: string]>;

export type RoundStartedEvent = GenericEvent<
  ServerEventKind.ROUND_STARTED,
  [artistId: string, round: number, choices: string | null]
>;

export type DrawingStartedEvent = GenericEvent<
  ServerEventKind.DRAWING_STARTED,
  [clue: string, secret: string | null]
>;

export type CorrectGuessEvent = GenericEvent<
  ServerEventKind.CORRECT_GUESS,
  [playerId: string, guessIndex: number, points: number]
>;

export type RoundEndedEvent = GenericEvent<ServerEventKind.ROUND_ENDED, [secret: string]>;

export type ChatMessageEvent = GenericEvent<
  ServerEventKind.CHAT_MESSAGE,
  [playerId: string, message: string]
>;

export type DrawingUpdateEvent = GenericEvent<
  ServerEventKind.DRAWING_UPDATE,
  [continueFlag: number, x: number, y: number, size: number, color: string]
>;

export type ClueUpdateEvent = GenericEvent<ServerEventKind.CLUE_UPDATE, [newClue: string]>;

export type GameEndedEvent = GenericEvent<ServerEventKind.GAME_ENDED, []>;

export type AnyServerEvent =
  | AsyncResponseEvent
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | RoundStartedEvent
  | DrawingStartedEvent
  | CorrectGuessEvent
  | RoundEndedEvent
  | ChatMessageEvent
  | DrawingUpdateEvent
  | ClueUpdateEvent
  | GameEndedEvent;

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
  choices: string[];
  secret: string | null;
  clue: string | null;
};

export type PlayerModel = {
  id: string;
  game: string;
  username: string;
  avatarUrl: string | null;
  score: number | null;
  guessIndex: number | null;
};

/**
 * Utility types
 */

type GenericEvent<
  K extends ServerEventKind | ClientEventKind,
  P extends (string | number | null)[]
> = {
  kind: K;
  payload: P;
};

/**
 * Game->players join query
 */
export type GameState = GameModel & {
  players: Player[];
};

/**
 * PlayerModel but with omitted reference to game_id
 * since we almost never need it
 */
export type Player = Omit<PlayerModel, "game">;

/**
 * Topic with joined words
 */
export type TopicWithWords = TopicModel & {
  words: string[];
};
