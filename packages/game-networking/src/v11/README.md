# v11 Consumer Tutorial

This tutorial shows how to define commands and events, provide handlers and contexts, select a transport adapter, and use every sender method. The framework does not depend on Socket.IO, WebSocket, or WebRTC; those transports implement the small `TransportAdapter` contract.

Replace `@your-scope/game-networking/v11` in the examples with the package entry point used by your application.

## 1. Define the command and event maps

Client commands and server events are separate maps. Their payload types are checked by TypeScript.

```ts
type PreAuthCommands = {
  authenticate: { authId: string };
};

type GameCommands = {
  message: { text: string };
};

type ClientCommands = PreAuthCommands & GameCommands;

type ServerEvents = {
  authenticated: {};
  message: { authId: string; text: string };
  error: { message: string };
};
```

## 2. Define contexts and handlers

Use a different context for each handler group. The pre-auth context has an owner-only sender; the authenticated context has the saved `authId` and the full sender.

```ts
import {
  createConnectionListener,
  createDispatcher,
  createSender,
  InMemoryService,
} from "@your-scope/game-networking/v11";
import type {
  Connection,
  HandlerMap,
  PreAuthSender,
  Sender,
  TransportAdapter,
} from "@your-scope/game-networking/v11";

type PreAuthContext = {
  connectionId: string;
  sender: PreAuthSender<ServerEvents>;
};

type GameContext = {
  authId: string;
  sender: Sender<ServerEvents>;
};

const connections = new InMemoryService<Connection>();

const preAuthHandlers: HandlerMap<PreAuthCommands, PreAuthContext> = {
  authenticate: ({ authId }, { connectionId, sender }) => {
    if (authId.length === 0) {
      sender.toOwner("error", { message: "Authentication failed" });
      return;
    }

    // Replace this example check with the application's actual auth validation.
    connections.set({ id: connectionId, authId });
    sender.toOwner("authenticated", {});
  },
};

const gameHandlers: HandlerMap<GameCommands, GameContext> = {
  message: ({ text }, { authId, sender }) => {
    sender.toAll("message", { authId, text });
  },
};
```

`HandlerMap` makes the event name, payload, and context agree at compile time. The framework does not validate untrusted network payloads at runtime; validate them in your transport adapter or handler before using them.

## 3. Implement the transport adapter

The adapter forwards connect, event, and disconnect callbacks with the transport's connection ID. Its only send primitive is `sendToConnection`; the framework builds the higher-level sender methods on top of it.

For example, a Socket.IO adapter can look like this:

```ts
import type { Server } from "socket.io";

function createSocketIoTransport(
  io: Server,
): TransportAdapter<ClientCommands, ServerEvents> {
  return {
    start(listener) {
      io.on("connection", (socket) => {
        listener.onConnect(socket.id);

        socket.onAny((event: string, payload: unknown) => {
          if (event === "authenticate") {
            listener.onEvent(
              "authenticate",
              payload as PreAuthCommands["authenticate"],
              socket.id,
            );
          } else if (event === "message") {
            listener.onEvent(
              "message",
              payload as GameCommands["message"],
              socket.id,
            );
          } else {
            socket.emit("error", { message: `Unknown command: ${event}` });
          }
        });

        socket.on("disconnect", () => listener.onDisconnect(socket.id));
      });
    },
    stop() {
      io.close();
    },
    sendToConnection(connectionId, event, payload) {
      io.to(connectionId).emit(String(event), payload);
    },
  };
}
```

For WebSocket or WebRTC, implement the same callbacks and map `sendToConnection` to a socket or peer. The handler and dispatcher code does not change.

## 4. Wire the contexts and listener

`createConnectionListener` stores a connection on connect, sends `authenticate` to the pre-auth handlers, sends other commands to the authenticated handlers only after `authId` is set, and deletes the connection on disconnect.

```ts
function createContexts(
  transport: TransportAdapter<ClientCommands, ServerEvents>,
) {
  return {
    preAuth: (connectionId: string): PreAuthContext => ({
      connectionId,
      sender: createSender(connectionId, connections, transport),
    }),
    game: (connectionId: string): GameContext => {
      const connection = connections.get(connectionId);
      if (!connection || connection.authId === undefined) {
        throw new Error(`Authenticated connection not found: ${connectionId}`);
      }

      return {
        authId: connection.authId,
        sender: createSender(connectionId, connections, transport),
      };
    },
  };
}

const transport = createSocketIoTransport(io);
const contexts = createContexts(transport);

const listener = createConnectionListener({
  connections,
  preAuth: {
    handlers: preAuthHandlers,
    createContext: contexts.preAuth,
  },
  authenticated: {
    handlers: gameHandlers,
    createContext: contexts.game,
  },
});

await transport.start(listener);

// During shutdown:
await transport.stop();
```

`createConnectionListener` uses `createDispatcher` internally. Use `createDispatcher` directly when an application needs custom routing:

```ts
const messageDispatcher = createDispatcher(gameHandlers, contexts.game);
messageDispatcher.dispatch("message", { text: "Hello" }, connectionId);
```

## 5. Send to the intended recipients

The sender is scoped to the connection that created its context:

```ts
sender.toOwner("message", payload);            // This connection
sender.toUser(userId, "message", payload);     // Connections whose authId matches userId
sender.toOthers("message", payload);           // Every connection except this one
sender.toAll("message", payload);              // Every connected client
```

The sender resolves recipients from the connection service and calls `sendToConnection` for each one. Therefore a transport adapter only needs to know how to reach one connection.

## 6. Use a different connection store

`InMemoryService<T>` implements `get`, `getAll`, `set`, and `delete`. It is useful for a single-process server. To use another store, pass an object implementing `CollectionService<Connection>` to `createSender` and a `Service<Connection>` to `createConnectionListener`.

The listener throws for unknown commands, missing connections, commands sent before authentication, and pre-auth commands sent after authentication. Handle those errors at the transport boundary and report them through the application's normal error path.
