import { EventMapBase } from "../../shared/types";

export type SendAndWaitOptions = {
  timeoutMs?: number;
};

export interface ISender<
  TClientToServer extends EventMapBase,
  TServerToClient extends EventMapBase,
> {
  send: <TEvent extends keyof TClientToServer>(
    event: TEvent,
    payload: TClientToServer[TEvent],
  ) => void;

  sendAndWait: <
    TSendEvent extends keyof TClientToServer,
    TReceiveEvent extends keyof TServerToClient,
  >(
    sendEvent: TSendEvent,
    receiveEvent: TReceiveEvent,
    sendPayload: TClientToServer[TSendEvent],
    options?: SendAndWaitOptions,
  ) => Promise<TServerToClient[TReceiveEvent]>;
}
