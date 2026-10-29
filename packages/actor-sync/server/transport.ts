import type { Server, Socket } from "socket.io";
import { ITransport } from "../core/transport";

type Listener<TPayload> = (payload: TPayload) => void;

export class SocketIOTransport<
  TEventPayloadMap extends Record<string, object>,
> implements ITransport<TEventPayloadMap> {
  private readonly listeners = new Map<keyof TEventPayloadMap, Set<unknown>>();

  constructor(private readonly io: Server) {
    this.io.on("connection", (socket) => {
      this.attach(socket);
    });
  }

  private attach(socket: Socket) {
    for (const [event, callbacks] of this.listeners) {
      for (const cb of callbacks) {
        socket.on(event as string, cb as Listener<object>);
      }
    }
  }

  on = <TEvent extends keyof TEventPayloadMap>(
    event: TEvent,
    cb: Listener<TEventPayloadMap[TEvent]>,
  ) => {
    let callbacks = this.listeners.get(event);
    if (!callbacks) {
      callbacks = new Set();
      this.listeners.set(event, callbacks);
    }
    callbacks.add(cb as unknown);

    for (const socket of this.io.sockets.sockets.values()) {
      socket.on(event as string, cb as Listener<object>);
    }
  };

  off = <TEvent extends keyof TEventPayloadMap>(
    event: TEvent,
    cb: Listener<TEventPayloadMap[TEvent]>,
  ) => {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;

    callbacks.delete(cb as unknown);
    if (callbacks.size === 0) this.listeners.delete(event);

    for (const socket of this.io.sockets.sockets.values()) {
      socket.off(event as string, cb as Listener<object>);
    }
  };

  send = <TEvent extends keyof TEventPayloadMap>(
    event: TEvent,
    payload: TEventPayloadMap[TEvent],
  ) => {
    this.io.emit(event as string, payload);
  };
}
