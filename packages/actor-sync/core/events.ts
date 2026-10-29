import { ActorSnapshot, StateSnapshot, ComponentSnapshot } from "./state";
import { ITransport } from "./transport";

export type ActorEvent = {
  type: "actor";
  action: "created" | "deleted";
  actor: ActorSnapshot;
  state: StateSnapshot;
};

export type ComponentEvent = {
  type: "component";
  action: "created" | "deleted" | "changed";
  actor: ActorSnapshot;
  component: ComponentSnapshot;
  state: StateSnapshot;
};

export class EventBus<
  TEventPayloadMap extends Record<string, object>,
> implements ITransport<TEventPayloadMap> {
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
