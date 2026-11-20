import { EventMapBase } from "../../shared/types";

export interface ISender<TServerToClient extends EventMapBase> {
  send: <TEvent extends keyof TServerToClient>(
    connectionId: string,
    event: TEvent,
    payload: TServerToClient[TEvent],
  ) => void | Promise<void>;
}
