import { Server, Socket } from "socket.io";
import { SocketIOSender } from "./SocketIOSender";

type SocketData = {
  authId: string;
};

type ServerSideEvents = {};

export class SocketIOListener<
  TClientToServerEvents extends Record<string, object>,
  TServerToClientEvents extends Record<string, object>,
> {
  constructor(io: Server, framework: any) {
    type TypedSocket = Socket<
      TClientToServerEvents,
      TServerToClientEvents,
      ServerSideEvents,
      SocketData
    >;

    io.use((socket: TypedSocket, next) => {
      const { token } = socket.handshake.auth;

      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      const { authId } = JSON.parse(token);

      if (!authId) {
        return next(new Error("Authentication error: token.authId missing"));
      }

      socket.data = { authId: authId };

      next();
    });

    io.on("connection", (socket: TypedSocket) => {
      const sender = new SocketIOSender<TServerToClientEvents>(io, socket);
      framework.onConnect(socket.data.authId, { sender });
      socket.onAny(framework.onEvent);

      socket.on("disconnect", () => {
        framework.onDisconnect(socket.data.authId);
      });
    });
  }
}
