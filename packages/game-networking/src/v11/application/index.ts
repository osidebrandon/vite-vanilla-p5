import {
  CollectionService,
  Connection,
  ConnectionTransport,
  Dispatcher,
  Entity,
  EventMapBase,
  HandlerGroup,
  HandlerMap,
  Listener,
  Service,
} from "../domain";

export const createDispatcher = <TEvents extends EventMapBase, TContext>(
  handlers: HandlerMap<TEvents, TContext>,
  createContext: (connectionId: string) => TContext,
): Dispatcher<TEvents> => ({
  dispatch: <TEvent extends keyof TEvents>(
    event: TEvent,
    payload: TEvents[TEvent],
    connectionId: string,
  ) => {
    const handler = handlers[event];

    if (
      !Object.prototype.hasOwnProperty.call(handlers, event) ||
      typeof handler !== "function"
    ) {
      throw new Error(`Handler not setup: ${String(event)}`);
    }

    handler(payload, createContext(connectionId));
  },
});

export type ConnectionListenerOptions<
  TPreAuthEvents extends EventMapBase,
  TAuthenticatedEvents extends EventMapBase,
  TPreAuthContext,
  TAuthenticatedContext,
> = {
  connections: Service<Connection>;
  preAuth: HandlerGroup<TPreAuthEvents, TPreAuthContext>;
  authenticated: HandlerGroup<TAuthenticatedEvents, TAuthenticatedContext>;
};

export const createConnectionListener = <
  TPreAuthEvents extends EventMapBase,
  TAuthenticatedEvents extends EventMapBase,
  TPreAuthContext,
  TAuthenticatedContext,
>(
  options: ConnectionListenerOptions<
    TPreAuthEvents,
    TAuthenticatedEvents,
    TPreAuthContext,
    TAuthenticatedContext
  >,
): Listener<TPreAuthEvents & TAuthenticatedEvents> => {
  const preAuthDispatcher = createDispatcher(
    options.preAuth.handlers,
    options.preAuth.createContext,
  );
  const authenticatedDispatcher = createDispatcher(
    options.authenticated.handlers,
    options.authenticated.createContext,
  );
  const preAuthEvents = new Set(Object.keys(options.preAuth.handlers));
  const authenticatedEvents = new Set(
    Object.keys(options.authenticated.handlers),
  );

  for (const event of preAuthEvents) {
    if (authenticatedEvents.has(event)) {
      throw new Error(`Command is registered in both handler groups: ${event}`);
    }
  }

  const dispatchPreAuth = (
    event: string,
    payload: object,
    connectionId: string,
  ) => {
    preAuthDispatcher.dispatch(
      event as keyof TPreAuthEvents,
      payload as TPreAuthEvents[keyof TPreAuthEvents],
      connectionId,
    );
  };

  const dispatchAuthenticated = (
    event: string,
    payload: object,
    connectionId: string,
  ) => {
    authenticatedDispatcher.dispatch(
      event as keyof TAuthenticatedEvents,
      payload as TAuthenticatedEvents[keyof TAuthenticatedEvents],
      connectionId,
    );
  };

  return {
    onConnect: (connectionId) => {
      options.connections.set({ id: connectionId });
    },
    onEvent: (event, payload, connectionId) => {
      const connection = options.connections.get(connectionId);

      if (!connection) {
        throw new Error(`Connection not found: ${connectionId}`);
      }

      const eventName = String(event);

      if (connection.authId === undefined) {
        if (!preAuthEvents.has(eventName)) {
          throw new Error(`Authentication required for command: ${eventName}`);
        }

        dispatchPreAuth(eventName, payload, connectionId);
        return;
      }

      if (preAuthEvents.has(eventName)) {
        throw new Error(
          `Pre-authentication command is not available after authentication: ${eventName}`,
        );
      }

      if (!authenticatedEvents.has(eventName)) {
        throw new Error(`Handler not setup: ${eventName}`);
      }

      dispatchAuthenticated(eventName, payload, connectionId);
    },
    onDisconnect: (connectionId) => {
      options.connections.delete(connectionId);
    },
  };
};

export const createSender = <TEvents extends EventMapBase>(
  ownerConnectionId: string,
  connections: CollectionService<Connection>,
  transport: ConnectionTransport<TEvents>,
): Sender<TEvents> => ({
  toOwner: <TEvent extends keyof TEvents>(
    event: TEvent,
    payload: TEvents[TEvent],
  ) => {
    transport.sendToConnection(ownerConnectionId, event, payload);
  },
  toUser: <TEvent extends keyof TEvents>(
    userId: string,
    event: TEvent,
    payload: TEvents[TEvent],
  ) => {
    for (const connection of connections.getAll()) {
      if (connection.authId === userId) {
        transport.sendToConnection(connection.id, event, payload);
      }
    }
  },
  toOthers: <TEvent extends keyof TEvents>(
    event: TEvent,
    payload: TEvents[TEvent],
  ) => {
    for (const connection of connections.getAll()) {
      if (connection.id !== ownerConnectionId) {
        transport.sendToConnection(connection.id, event, payload);
      }
    }
  },
  toAll: <TEvent extends keyof TEvents>(
    event: TEvent,
    payload: TEvents[TEvent],
  ) => {
    for (const connection of connections.getAll()) {
      transport.sendToConnection(connection.id, event, payload);
    }
  },
});

export class InMemoryService<T extends Entity> implements CollectionService<T> {
  private readonly _db = new Map<string, T>();

  get = (id: string) => this._db.get(id);

  getAll = () => Array.from(this._db.values());

  set = (entity: T) => {
    this._db.set(entity.id, entity);
  };

  delete = (id: string) => {
    this._db.delete(id);
  };
}
