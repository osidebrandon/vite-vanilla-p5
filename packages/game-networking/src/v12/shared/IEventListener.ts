import { EventMapBase } from "./types";

export interface IEventListener<TEvents extends EventMapBase> {
  onEvent: <TEvent extends keyof TEvents>(
    event: TEvent,
    cb: (payload: TEvents[TEvent]) => void | Promise<void>,
  ) => () => void;

  offEvent: <TEvent extends keyof TEvents>(
    event: TEvent,
    cb: (payload: TEvents[TEvent]) => void | Promise<void>,
  ) => void;
}
