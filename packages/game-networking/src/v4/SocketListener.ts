import { Server } from "socket.io";
import { SessionRepository } from "./SessionRepository";

type ListenEvents = {
  "join:game": unknown;
  "leave:game": unknown;
};

export class SocketListener {
  constructor(io: Server, sessionRepository: SessionRepository) {
    io.use((socket, next) => {
      const { token } = socket.handshake.auth;

      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      const { authId } = JSON.parse(token);

      if (!authId) {
        return next(new Error("Authentication error: token.authId missing"));
      }

      sessionRepository.startSession(authId);

      next();
    });

    io.on("connection", (socket) => {
      //
      // TODO
      //
      socket.on("disconnect", () => {
        sessionRepository.stopSession(socket.id);
        //
        // TODO
        //
      });
    });
  }
}
