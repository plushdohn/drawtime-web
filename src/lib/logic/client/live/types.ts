import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "../../shared-types";

export type ExtendedSocket = Socket<ServerToClientEvents, ClientToServerEvents> & {
  auth: {
    [key: string]: string;
  };
};
