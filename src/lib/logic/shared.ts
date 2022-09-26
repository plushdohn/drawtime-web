import { z } from "zod";

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
  avatarUrl: string;
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
  word: string;
  topic: string;
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
  avatarUrl: string;
  score: number | null;
  guessIndex: number | null;
};

export const enum ClientEvent {
  CREATE_GAME = "CG",
  JOIN_GAME = "JG",
  START_GAME = "SG",
  CHOOSE_WORD = "CW",
  DRAWING_UPDATE = "DU",
  CHAT_MESSAGE = "CM",
  MAKE_GUESS = "MG",
}

export const enum DrawingUpdateKind {
  Start = "S",
  Continue = "C",
}

export type ClientEventSignatures = {
  [ClientEvent.CREATE_GAME]: [
    asyncId: string,
    topicId: string,
    drawingTime: string,
    rounds: string
  ];
  [ClientEvent.JOIN_GAME]: [asyncId: string, gameId: string];
  [ClientEvent.START_GAME]: [];
  [ClientEvent.CHOOSE_WORD]: [word: string];
  [ClientEvent.DRAWING_UPDATE]: [
    kind: DrawingUpdateKind,
    x: string,
    y: string,
    size: string,
    color: string
  ];
  [ClientEvent.CHAT_MESSAGE]: [message: string];
  [ClientEvent.MAKE_GUESS]: [guess: string];
};

export const enum ServerEvent {
  ASYNC_RESPONSE = "AR",
  PLAYER_JOINED = "PJ",
  PLAYER_LEFT = "PL",
  ROUND_STARTED = "GS",
  DRAWING_STARTED = "DS",
  CORRECT_GUESS = "CG",
  ROUND_ENDED = "RE",
  GAME_ENDED = "GE",
  CHAT_MESSAGE = "CM",
  DRAWING_UPDATE = "DU",
}

export type ServerEventSignatures = {
  [ServerEvent.ASYNC_RESPONSE]: [asyncId: string, json: string];
  [ServerEvent.PLAYER_JOINED]: [
    playerId: string,
    playerName: string,
    avatarUrl: string
  ];
  [ServerEvent.PLAYER_LEFT]: [playerId: string];
  [ServerEvent.ROUND_STARTED]: [
    artistId: string,
    round: string,
    choices?: string
  ];
  [ServerEvent.DRAWING_STARTED]: [clue: string, secret?: string];
  [ServerEvent.CORRECT_GUESS]: [
    playerId: string,
    guessIndex: string,
    newScore: string
  ];
  [ServerEvent.ROUND_ENDED]: [secret: string];
  [ServerEvent.GAME_ENDED]: [];
  [ServerEvent.CHAT_MESSAGE]: [senderId: string, contents: string];
  [ServerEvent.DRAWING_UPDATE]: [
    kind: DrawingUpdateKind,
    x: string,
    y: string,
    size: string,
    color: string
  ];
};

export type GameState = GameModel & {
  players: Player[];
};

export type Player = Omit<PlayerModel, "game">;

export const topicSchema = z.object({
  name: z
    .string()
    .min(4, "Name must contain at least 4 characters.")
    .max(60, "Name can't contain more than 50 characters."),
  words: z
    .array(
      z
        .string()
        .min(2, "Words need to have at least 2 characters.")
        .max(32, "Words can't be longer than 32 characters.")
    )
    .min(9, "At least 9 words are required.")
    .max(512, "Playlist can't have more than 512 words")
    .superRefine((arr, ctx) => {
      const item = arr.find((val) => arr.indexOf(val) !== arr.lastIndexOf(val));

      if (item !== undefined) {
        const startIndex = arr.indexOf(item);
        const endIndex = arr.lastIndexOf(item);

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `List contains duplicate word "${item}".`,
        });

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate of word ${endIndex + 1}.`,
          path: [startIndex],
        });

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate of word ${startIndex + 1}.`,
          path: [endIndex],
        });
      }
    }),
  nsfw: z.boolean(),
  unlisted: z.boolean(),
  thumbnail: z.string({ invalid_type_error: "This field is required." }),
});
