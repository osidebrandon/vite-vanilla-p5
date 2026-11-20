export type EventMapBase = Record<string, object>;

export type Handler<TPayload, TContext> = (
  payload: TPayload,
  context: TContext,
) => void;

export type HandlerMap<TEvents extends EventMapBase, TContext> = {
  [TEvent in keyof TEvents]: Handler<TEvents[TEvent], TContext>;
};

export type HandlerGroup<TEvents extends EventMapBase, TContext> = {
  handlers: HandlerMap<TEvents, TContext>;
  createContext: (connectionId: string) => TContext;
};

export type Dispatcher<TEvents extends EventMapBase> = {
  dispatch: <TEvent extends keyof TEvents>(
    event: TEvent,
    payload: TEvents[TEvent],
    connectionId: string,
  ) => void;
};

export type Listener<TEvents extends EventMapBase> = {
  onConnect: (connectionId: string) => void;
  onEvent: <TEvent extends keyof TEvents>(
    event: TEvent,
    payload: TEvents[TEvent],
    connectionId: string,
  ) => void;
  onDisconnect: (connectionId: string) => void;
};

export type Entity = { id: string };

export type Service<T extends Entity> = {
  get: (id: string) => T | undefined;
  set: (entity: T) => void;
  delete: (id: string) => void;
};

export type CollectionService<T extends Entity> = Service<T> & {
  getAll: () => T[];
};

export type Connection = {
  id: string;
  authId?: string;
};

export type ConnectionTransport<TEvents extends EventMapBase> = {
  sendToConnection: <TEvent extends keyof TEvents>(
    connectionId: string,
    event: TEvent,
    payload: TEvents[TEvent],
  ) => void;
};

export type TransportAdapter<
  TIncoming extends EventMapBase,
  TOutgoing extends EventMapBase,
> = ConnectionTransport<TOutgoing> & {
  start: (listener: Listener<TIncoming>) => void | Promise<void>;
  stop: () => void | Promise<void>;
};

export type PreAuthSender<TSendEvents extends EventMapBase> = {
  toOwner: <TEvent extends keyof TSendEvents>(
    event: TEvent,
    payload: TSendEvents[TEvent],
  ) => void;
};

export type Sender<TSendEvents extends EventMapBase> =
  PreAuthSender<TSendEvents> & {
    toUser: <TEvent extends keyof TSendEvents>(
      userId: string,
      event: TEvent,
      payload: TSendEvents[TEvent],
    ) => void;
    toOthers: <TEvent extends keyof TSendEvents>(
      event: TEvent,
      payload: TSendEvents[TEvent],
    ) => void;
    toAll: <TEvent extends keyof TSendEvents>(
      event: TEvent,
      payload: TSendEvents[TEvent],
    ) => void;
  };
