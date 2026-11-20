import { createServer } from "http";
import { Server } from "socket.io";
import { basicLifecycle } from "@lifecycles";
import { EventBus } from "@events";

const PORT = 3001;
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// This depends on the type of framework...
type SingleGameCommands = {
  "game:join": void;
  "game:leave": void;
};
type SingleGameHandlers = {
  "game:join": () => void;
  "game:leave": () => void;
};

type GameEvents = {
  "player:joined": { player: MyPlayer };
  "player:left": { player: MyPlayer };
};
type MyPlayer = {
  id: string;
};

// === Infrastructure === //
const commandBus = new EventBus<SingleGameCommands>();
const eventBus = new EventBus<GameEvents>();

// === Transport === //
// TODO: Figure out how to wire this with the event buses.
const transport = new SocketIOTransport(io);

// === Dispatchers === //
const commandDispatcher = new BusListener<SingleGameCommands>(commandBus);
const eventDispatcher = new BusListener<GameEvents>(eventBus);

// === Managers === //
const playerManager = new Repository<MyPlayer>();

// === Single Game Handlers === //
const singleGameHandlers = {
  "game:join": () => {},
  "game:leave": () => {},
};

// === Architecture === //
//
// Single Room vs Multi Room
//

// === Runtime === //

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
