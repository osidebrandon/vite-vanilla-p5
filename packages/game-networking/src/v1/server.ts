import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import { basicLifecycle } from "@lifecycles";
import { logServerStartup, logServerShutdown } from "./logging";
import { EventBus } from "@events";
import { createDispatcher, EventMapBase, HandlerMap } from "./dispatcher";
import { ClientToServerEvents } from "./commands";
import { ServerToClientEvents } from "./events";

// === FRAMEWORK === //

type Sender = {
  // TODO
};

type ServerContext = {
  sender: Sender;
};

const serverHandlers: HandlerMap<ClientToServerEvents, ServerContext> = {
  "join-game": (event, context) => {
    console.log({ event, context });
  },
  "leave-game": (event, context) => {
    console.log({ event, context });
  },
};

const eventBus = new EventBus<ClientToServerEvents>();

const dispatcher = createDispatcher<ClientToServerEvents, ServerContext>(
  serverHandlers,
  () => {
    return {
      sender: {
        toOwner: () => {},
        toPlayer: () => {},
        toAll: () => {},
      },
    };
  },
);

// === GLOBALS === //

const PORT = 3001;

const httpServer = createServer();
const socketServer = new SocketServer();

// === LIFECYCLE === //

basicLifecycle({
  onStart: () => {
    httpServer.listen(PORT, () => {
      logServerStartup(PORT);
    });
  },
  onStop: () => {
    httpServer.close(() => {
      logServerShutdown();
    });
  },
});
