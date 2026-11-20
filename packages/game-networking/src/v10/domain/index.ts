export type Handler<TPayload, TContext> = (
  payload: TPayload,
  context: TContext,
) => void;

export type HandlerMap<TEvents extends EventMapBase, TContext> = {
  [TEvent in keyof TEvents]: Handler<TEvents[TEvent], TContext>;
};

export type Factory<T, TParam = void> = (params: TParam) => T;

export type Entity = { id: string };
export type Service<T extends Entity> = {
  get: (id: string) => T | undefined;
  set: (entity: T) => void;
  delete: (id: string) => void;
};

export type EventMapBase = Record<string, object>;
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

export type PreAuthSender<TSendEvents extends Record<string, object>> = {
  toOwner: <TName extends keyof TSendEvents>(
    event: TName,
    payload: TSendEvents[TName],
  ) => void;
};

export type Sender<TSendEvents extends Record<string, object>> = {
  toOwner: <TName extends keyof TSendEvents>(
    event: TName,
    payload: TSendEvents[TName],
  ) => void;
  toUser: <TName extends keyof TSendEvents>(
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
};

export type Connection = {
  id: string;
  authId?: string;
};
