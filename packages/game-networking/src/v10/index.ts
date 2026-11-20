import { createServer } from "http";
import { Server } from "socket.io";
import { basicLifecycle } from "@lifecycles";
import {
  createDispatcher,
  initializeSocketIOTransport,
  InMemoryService,
} from "./application";
import { Connection, HandlerMap, PreAuthSender, Sender } from "./domain";

const PORT = 3001;
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const connectionService = new InMemoryService<Connection>();

// === PRE-AUTH === //

type PreAuthCommands = {
  authenticate: { authId: string };
};

type PreAuthEvents = {
  authenticated: {};
};

type PreAuthContext = {
  connectionId: string;
  sender: PreAuthSender<PreAuthEvents>;
};

const preAuthHandlers: HandlerMap<PreAuthCommands, PreAuthContext> = {
  authenticate: ({ authId }, { connectionId, sender }) => {
    connectionService.set({ id: connectionId, authId });
    sender.toOwner("authenticated", {});
  },
};

const preAuthDispatcher = createDispatcher<PreAuthCommands, PreAuthContext>(
  preAuthHandlers,
  (connectionId) => {
    return {
      connectionId, // Not sure...
      sender: createPreAuthSender(),
    };
  },
);

initializeSocketIOTransport<PreAuthCommands>(io, {
  onConnect: (connectionId) => {
    connectionService.set({ id: connectionId });
  },
  onEvent: preAuthDispatcher.dispatch,
  onDisconnect: (connectionId) => {
    connectionService.delete(connectionId);
  },
});

// === POST-AUTH === //

type MyCommands = {
  message: { text: string };
};

type MyEvents = {
  message: { text: string; authId: string };
  error: { message: string };
};

type Context = PreAuthContext | PostAuthContext;
type Commands = PreAuthCommands | MyCommands;

type PostAuthContext = {
  sender: Sender<MyEvents>;
};

const handlers: HandlerMap<Commands, Context> = {
  authenticate: ({ authId }, { sender }) => {
    // TODO: Authenticate.

    sender.toOwner("authenticated", {});
  },
  message: ({ text }, { authId, sender }) => {
    sender.toAll("message", { authId, text });
  },
};

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
