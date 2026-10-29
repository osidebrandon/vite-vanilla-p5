import { ActorSnapshot, StateSnapshot, ComponentSnapshot } from "./state";

export type ActorEvent = {
  actor: ActorSnapshot;
  state: StateSnapshot;
};

export type ComponentEvent = {
  actor: ActorSnapshot;
  component: ComponentSnapshot;
  state: StateSnapshot;
};

export type EventsMap = {
  "actor:created": ActorEvent;
  "actor:deleted": ActorEvent;
  "component:added": ComponentEvent;
  "component:changed": ComponentEvent;
  "component:removed": ComponentEvent;
};

export class EventBus<TEventPayloadMap extends Record<string, object>>
  implements IListener<TEventPayloadMap>, ISender<TEventPayloadMap>
{
  private readonly listeners = new Map<keyof TEventPayloadMap, Set<unknown>>();

  on = <TEvent extends keyof TEventPayloadMap>(
    event: TEvent,
    cb: (payload: TEventPayloadMap[TEvent]) => void,
  ) => {
    let eventListeners = this.listeners.get(event);
    if (!eventListeners) {
      eventListeners = new Set();
      this.listeners.set(event, eventListeners);
    }
    eventListeners.add(cb);
  };

  off = <TEvent extends keyof TEventPayloadMap>(
    event: TEvent,
    cb: (payload: TEventPayloadMap[TEvent]) => void,
  ) => {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    eventListeners.delete(cb);
    if (eventListeners.size === 0) this.listeners.delete(event);
  };

  send = <TEvent extends keyof TEventPayloadMap>(
    event: TEvent,
    payload: TEventPayloadMap[TEvent],
  ) => {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    for (const listener of [...eventListeners]) {
      (listener as (payload: TEventPayloadMap[TEvent]) => void)(payload);
    }
  };
}

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
