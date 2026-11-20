import { Server, Socket } from "socket.io";
import { ISender } from ".";

export class SocketIOSender<
  TSendEvents extends Record<string, object>,
> implements ISender<TSendEvents> {
  constructor(
    private readonly io: Server,
    private readonly socket: Socket,
    private readonly socketManager: ISocketManager,
  ) {}

  toOwner = <TName extends keyof TSendEvents>(
    event: TName,
    payload: TSendEvents[TName],
  ) => {
    this.socket.emit(event as string, payload);
  };

  toClient = <TName extends keyof TSendEvents>(
    userId: string,
    event: TName,
    payload: TSendEvents[TName],
  ) => {
    this.socketManager.getSocketByUserId(userId).emit(event, payload);
  };

  toOthers = <TName extends keyof TSendEvents>(
    event: TName,
    payload: TSendEvents[TName],
  ) => {};

  toAll = <TName extends keyof TSendEvents>(
    event: TName,
    payload: TSendEvents[TName],
  ) => {};
}
