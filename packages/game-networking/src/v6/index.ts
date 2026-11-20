import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { basicLifecycle } from "@lifecycles";
import { SocketIOListener } from "./SocketIOListener";

// === DISPATCH FRAMEWORK === //

export interface ISender<TSendEvents extends Record<string, object>> {
  toOwner: <TName extends keyof TSendEvents>(
    event: TName,
    payload: TSendEvents[TName],
  ) => void;
  toClient: <TName extends keyof TSendEvents>(
    userId: string,
    event: TName,
    payload: TSendEvents[TName],
  ) => void;
  toOthers: <TName extends keyof TSendEvents>(
    event: TName,
    payload: TSendEvents[TName],
  ) => void;
  toAll: <TName extends keyof TSendEvents>(
    event: TName,
    payload: TSendEvents[TName],
  ) => void;
}

type HandlerFn<TPayload, TContext> = (
  payload: TPayload,
  context: TContext,
) => void;

type FrameworkEventContext<TSendEvents extends Record<string, object>> = {
  sender: ISender<TSendEvents>;
};

class Framework<
  TListenEvents extends Record<string, object>,
  TSendEvents extends Record<string, object>,
> {
  constructor() {}

  onConnect = (userId: string, context: FrameworkEventContext<TSendEvents>) => {
    // TODO
  };

  onDisconnect = (
    userId: string,
    context: FrameworkEventContext<TSendEvents>,
  ) => {
    // TODO
  };

  onEvent = <TName extends keyof TListenEvents>(
    event: TName,
    payload: TListenEvents[TName],
    context: FrameworkEventContext<TSendEvents>,
  ) => {
    // TODO
  };
}

// === CONSUMER === //

type MyEvents = {
  "join:game": { gameId: string };
  "leave:game": { gameId: string };
};

type MyContext = {
  state: unknown;
  sender: unknown;
  session: unknown;
};

const context = {
  state: {},
  sender: {},
  session: {},
};

const customHandlers: HandlerMap<MyEvents, MyContext> = {
  "join:game": (payload, context) => {},
  "leave:game": (payload, context) => {},
};

const PORT = 3001;
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const applicationHandlers = {
  handleConnect: (userId: string, context: FrameworkHandlerContext) => {
    // TODO
  },
  handleDisconnect: (userId: string, context: FrameworkHandlerContext) => {
    // TODO
  },
};

const framework = new Framework<MyListenEvents, MySendEvents>(sender);
const listener = new SocketIOListener(io, framework);

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
