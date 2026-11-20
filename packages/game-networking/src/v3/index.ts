import { basicLifecycle } from "@lifecycles";
import { Server } from "socket.io";
import { createServer } from "http";
import { SocketListener } from "./application/SocketListener";
import { Dispatcher } from "./application/Dispatcher";
import { SocketSender } from "./application/SocketSender";
import { ISender } from "./domain/ISender";

const PORT = 3001;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

export type Context = { sender: ISender };

type JoinGamePayload = { playerId: string; gameId: string };
type LeaveGamePayload = { playerId: string };
type ListenEvents = {
  "join:game": JoinGamePayload;
  "leave:game": LeaveGamePayload;
};
const handlers = {
  "join:game": (payload: JoinGamePayload, context: Context) => {
    //
    // TODO
    //
  },
  "leave:game": (payload: LeaveGamePayload, context: Context) => {
    //
    // TODO
    //
  },
};

const socketSender = new SocketSender(io);
const dispatcher = new Dispatcher<ListenEvents>(handlers, socketSender);
const _socketListener = new SocketListener<ListenEvents>(io, dispatcher);

basicLifecycle({
  onStart: () => {
    httpServer.listen(PORT, () => {
      console.log(`Server running: localhost:${PORT}`);
    });
  },
  onStop: () => {
    httpServer.close();
  },
});
