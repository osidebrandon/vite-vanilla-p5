import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { v4 } from "uuid";
import { basicLifecycle } from "@lifecycles";

// === TRANSPORT === //

export interface IListener {}

// === SESSION === //

export type Session = {
  sessionId: string;
  userId: string;
};

export interface ISessionRepository {
  getSession: (sessionId: string) => Session | undefined;
  createSession: (session: Session) => void;
  replaceSession: (session: Session) => void;
  deleteSession: (sessionId: string) => void;
}

// === HANDLER === //

export type Context<TEvents extends Record<string, object>> = {
  session: Session;
  sender: ISender<TEvents>;
};

export type Handler<TEvents extends Record<string, object>> = <
  TPayload extends object,
>(
  payload: TPayload,
  context: Context<TEvents>,
) => void;

export type HandlersMap<TEvents extends Record<string, object>> = {
  [TName in keyof TEvents]: Handler<TEvents>;
};

export interface ISender<TEvents extends Record<string, object>> {
  toOwner: <TName extends keyof TEvents>(
    event: TName,
    payload: TEvents[TName],
  ) => void;
  toClient: <TName extends keyof TEvents>(
    userId: string,
    event: TName,
    payload: TEvents[TName],
  ) => void;
  toOthers: <TName extends keyof TEvents>(
    event: TName,
    payload: TEvents[TName],
  ) => void;
  toAll: <TName extends keyof TEvents>(
    event: TName,
    payload: TEvents[TName],
  ) => void;
}

// === Dispatching === //

export interface IDispatcher<TEvents extends Record<string, object>> {
  dispatch: <TName extends keyof TEvents>(
    event: TName,
    payload: TEvents[TName],
  ) => void;
}

// === CONSUMER IMPLEMENTATION === //

export class SocketListener<
  TEvents extends Record<string, object>,
> implements IListener {
  constructor(
    io: Server,
    sessionRepository: ISessionRepository,
    dispatcher: IDispatcher<TEvents>,
  ) {
    type TypedSocket = Socket<TEvents>;

    io.use((socket, next) => {
      const { token } = socket.handshake.auth;

      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      const { authId } = JSON.parse(token);

      if (!authId) {
        return next(new Error("Authentication error: token.authId missing"));
      }

      sessionRepository.createSession({
        sessionId: v4(),
        userId: authId,
      });

      next();
    });

    io.on("connection", (socket: TypedSocket) => {
      socket.onAny((event, payload) => {
        dispatcher.dispatch(event, payload);
      });

      //
      // TODO
      //

      socket.on("disconnect", () => {
        sessionRepository.deleteSession(socket.id);
        //
        // TODO
        //
      });
    });
  }
}

export class InMemorySessionRepository implements ISessionRepository {
  private _sessions: Record<string, Session> = {};

  getSession = (sessionId: string) => {
    return this._sessions[sessionId];
  };

  createSession = (session: Session) => {
    const found = this._sessions[session.sessionId];
    if (found) throw new Error("Session already exists");
    this._sessions[session.sessionId] = session;
  };

  replaceSession = (session: Session) => {
    const found = this._sessions[session.sessionId];
    if (!found) throw new Error("Session does not exist");
    this._sessions[session.sessionId] = session;
  };

  deleteSession = (sessionId: string) => {
    const found = this._sessions[sessionId];
    if (!found) throw new Error("Session does not exist");
    delete this._sessions[sessionId];
  };
}

export class Dispatcher<
  TEvents extends Record<string, object>,
> implements IDispatcher<TEvents> {
  constructor(
    private readonly sessions: ISessionRepository,
    private readonly handlers: HandlersMap<TEvents>,
  ) {}

  dispatch = <TName extends keyof TEvents>(
    event: TName,
    payload: TEvents[TName],
  ) => {
    const handler = this.handlers[event];
    if (!handler) throw new Error(`No handler exists: ${String(event)}`);

    // TODO: How do we get a session...?
    const session = this.sessions.getSession();
    if (!session) throw new Error(`No session exists: ${session.sessionId}`);

    const sender = createSender();
    handler(payload, { sender, session });
  };
}

type MyEvents = {
  "join:game": { gameId: string };
  "leave:game": { gameId: string };
};

const PORT = 3001;
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const inMemoryRepository = new InMemorySessionRepository();
const dispatcher = new Dispatcher<MyEvents>(inMemoryRepository, {
  "join:game": (payload, context) => {
    console.log({ payload, context });
  },
  "leave:game": (payload, context) => {
    console.log({ payload, context });
  },
});
const _socketListener = new SocketListener(io, inMemoryRepository, dispatcher);

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
