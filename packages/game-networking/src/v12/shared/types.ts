export type EventMapBase = Record<string, unknown>;

export type Handler<TPayload> = (payload: TPayload) => void | Promise<void>;
export type HandlerMap<TEvents extends EventMapBase> = {
  [TEvent in keyof TEvents]: Handler<TEvents[TEvent]>;
};

export type ErrorBase = { message: string };
