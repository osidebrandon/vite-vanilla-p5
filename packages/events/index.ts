export type Listener<TEvent> = (event: TEvent) => void;

type AnyListener<TEvents extends object> = <TName extends keyof TEvents>(
  eventName: TName,
  event: TEvents[TName],
) => void;

export interface IListener<TEvents extends object> {
  on<TName extends keyof TEvents>(
    eventName: TName,
    listener: Listener<TEvents[TName]>,
  ): void;
  off<TName extends keyof TEvents>(
    eventName: TName,
    listener: Listener<TEvents[TName]>,
  ): void;
}

export interface IPublisher<TEvents extends object> {
  publish<TName extends keyof TEvents>(
    eventName: TName,
    event: TEvents[TName],
  ): void;
}

export class EventBus<TEvents extends object>
  implements IListener<TEvents>, IPublisher<TEvents>
{
  readonly #listeners = new Map<keyof TEvents, Set<Listener<never>>>();
  readonly #anyListeners = new Set<AnyListener<TEvents>>();

  // Arrow properties stay bound, so methods can be passed around (e.g. `on: eventBus.on`).
  on = <TName extends keyof TEvents>(
    eventName: TName,
    listener: Listener<TEvents[TName]>,
  ): void => {
    let listeners = this.#listeners.get(eventName);

    if (!listeners) {
      listeners = new Set();
      this.#listeners.set(eventName, listeners);
    }

    listeners.add(listener);
  };

  off = <TName extends keyof TEvents>(
    eventName: TName,
    listener: Listener<TEvents[TName]>,
  ): void => {
    const listeners = this.#listeners.get(eventName);

    if (!listeners) {
      return;
    }

    listeners.delete(listener);

    if (listeners.size === 0) {
      this.#listeners.delete(eventName);
    }
  };

  onAny = (listener: AnyListener<TEvents>): void => {
    this.#anyListeners.add(listener);
  };

  offAll = (): void => {
    this.#listeners.clear();
    this.#anyListeners.clear();
  };

  publish = <TName extends keyof TEvents>(
    eventName: TName,
    event: TEvents[TName],
  ): void => {
    const listeners = this.#listeners.get(eventName);
    const anyListeners = [...this.#anyListeners];

    if (listeners) {
      for (const listener of [...listeners] as Listener<TEvents[TName]>[]) {
        listener(event);
      }
    }

    for (const listener of anyListeners) {
      listener(eventName, event);
    }
  };
}
