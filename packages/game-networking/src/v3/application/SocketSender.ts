import { Server } from "socket.io";
import { ISender } from "../domain/ISender";

export class SocketSender implements ISender {
  constructor(private readonly io: Server) {}

  toOwner = () => {};
  toPlayer = () => {};
  toOthers = () => {};
  broadcast = () => {};
}
