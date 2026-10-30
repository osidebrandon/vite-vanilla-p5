import { Server } from "socket.io";

type RequestEvents = {
  a: { a: "a" };
  b: { b: "b" };
};

type ResponseEvents = {
  c: { c: "c" };
  d: { d: "d" };
};

const handlers: HandlerMap<RequestEvents> = {
  a: (payload, { clientId }) => {
    console.log({ clientId, payload });
  },
  b: (payload, { clientId }) => {
    console.log({ clientId, payload });
  },
};

const server = createServer<RequestEvents, ResponseEvents>(io, handlers);

// === Framework === //

type HandlerContext = { clientId: string };
type Handler = <TPayload extends object>(
  payload: TPayload,
  context: HandlerContext,
) => void | Promise<void>;
type HandlerMap<TEvents extends DefaultEvents> = {
  [TEvent in keyof TEvents]: Handler<TEvent, TEvents[TEvent]>;
};

type DefaultEvents = Record<string, unknown>;

type SocketData = {
  connection?: {
    clientId: string;
    // room: Room;
  };
};

export const createServer = <
  TRequestEvents extends DefaultEvents,
  TResponseEvents extends DefaultEvents,
>(
  io: Server,
) => {
  type TypedServer = Server<TRequestEvents, TResponseEvents, {}, SocketData>;

  io.on("connection", (socket) => {});
};
