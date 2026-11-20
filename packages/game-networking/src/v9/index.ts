import { createServer } from "http";
import { Server } from "socket.io";
import { basicLifecycle } from "@lifecycles";

// === FRAMEWORK === //

// === CONSUMER === //

const PORT = 3001;
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

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
