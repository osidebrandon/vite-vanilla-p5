import { Server, Socket } from "socket.io";
import { createLogger } from "../logging";
import { IDispatcher } from "../domain/IDispatcher";

type ListenEvents = {
  "join:game": unknown;
  "leave:game": unknown;
};

export class SocketListener<TEvents extends object> {
  private _logger = createLogger("SOCKETS");

  constructor(server: Server, dispatcher: IDispatcher<TEvents>) {
    type TypedSocket = Socket<ListenEvents>;

    server.on("connection", (socket: TypedSocket) => {
      this._logger.log(`Client connected. Socket ID ${socket.id}`);

      //
      // TODO
      //
      socket.on("disconnect", () => {
        //
        // TODO
        //
      });
    });
  }
}
