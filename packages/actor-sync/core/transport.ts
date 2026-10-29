//
// [Consumer] must implement ITransport.
//
export interface ITransport<TEventPayloadMap extends Record<string, object>>
  extends IListener<TEventPayloadMap>, ISender<TEventPayloadMap> {}

export interface IListener<TEventPayloadMap extends Record<string, object>> {
  on: <TEvent extends keyof TEventPayloadMap>(
    event: TEvent,
    cb: (payload: TEventPayloadMap[TEvent]) => void,
  ) => void;
  off: <TEvent extends keyof TEventPayloadMap>(
    event: TEvent,
    cb: (payload: TEventPayloadMap[TEvent]) => void,
  ) => void;
}

export interface ISender<TEventPayloadMap extends Record<string, object>> {
  send: <TEvent extends keyof TEventPayloadMap>(
    event: TEvent,
    payload: TEventPayloadMap[TEvent],
  ) => void;
}
