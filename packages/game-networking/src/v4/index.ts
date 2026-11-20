import { Server } from "socket.io";
import { createServer } from "http";
import { basicLifecycle } from "@lifecycles";
import { SessionRepository } from "./SessionRepository";
import { SocketListener } from "./SocketListener";

const PORT = 3001;
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const sessionRepository = new SessionRepository();
const socketListener = new SocketListener(io, sessionRepository);

basicLifecycle({
  onStart: () => {
    httpServer.listen(PORT, () => {
      console.log(`Server running: localhost:${PORT}`);
    });
  },
  onStop: () => {
    httpServer.close();
  },
});
