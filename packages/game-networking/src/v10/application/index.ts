import { Server } from "socket.io";
import {
  Dispatcher,
  Entity,
  EventMapBase,
  HandlerMap,
  Listener,
  Service,
} from "../domain";

export const createDispatcher = <TEvents extends EventMapBase, TContext>(
  handlers: HandlerMap<TEvents, TContext>,
  createContext: (connectionId: string) => TContext,
): Dispatcher<TEvents> => {
  return {
    dispatch: <TEvent extends keyof TEvents>(
      e: TEvent,
      payload: TEvents[TEvent],
      connectionId: string,
    ) => {
      const handler = handlers[e];

      if (!handler) {
        throw new Error(`Handler not setup: ${String(e)}`);
      }

      handler(payload, createContext(connectionId));
    },
  };
};

export const initializeSocketIOTransport = <TEvents extends EventMapBase>(
  io: Server,
  callbacks: Listener<TEvents>,
) => {
  io.on("connection", (socket) => {
    callbacks.onConnect(socket.id);

    socket.onAny((event, payload) => callbacks.onEvent(event, payload));

    socket.on("disconnect", () => {
      callbacks.onDisconnect(socket.id);
    });
  });
};

export class InMemoryService<T extends Entity> implements Service<T> {
  private _db: Record<string, T> = {};

  get = (id: string) => {
    return this._db[id];
  };

  set = (entity: T) => {
    this._db[entity.id] = entity;
  };

  delete = (id: string) => {
    delete this._db[id];
  };
}
