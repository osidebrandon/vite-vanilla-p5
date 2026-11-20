import { EventBus } from "@events";
import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import { basicLifecycle } from "@lifecycles";

//
// Step: Initialize command bus
//

type JoinGamePayload = { playerId: string };
type LeaveGamePayload = { playerId: string };
type GameCommands = {
  "join-game": JoinGamePayload;
  "leave-game": LeaveGamePayload;
};

const commandBus = new EventBus<GameCommands>();

//
// Step 3: Initialize event bus
//

type PlayerPayload = { player: unknown };
type GameEvents = {
  "player:joined": PlayerPayload;
  "player:left": PlayerPayload;
};

const eventBus = new EventBus<GameEvents>();

//
// Step: Initialize command handlers
//

const commandHandlers = {
  "join-game": (payload: JoinGamePayload) => {
    //
    // TODO
    //
    console.log("Add player to game...");
    eventBus.publish("player:joined", { player: {} });
  },
  "leave-game": (payload: LeaveGamePayload) => {
    //
    // TODO
    //
    console.log("Remove player from game...");
    eventBus.publish("player:left", { player: {} });
  },
};

//
// Step 4: Initialize command listener
//

Object.values(commandHandlers).forEach(([e]) => {
  commandBus.on(e, (payload) => {
    commandBus.publish(e, payload);
  });
});

//
// Step 5: Initialize event listener
//

//
// Step 7: Initialize event handlers
//

const eventHandlers = {
  "player:joined": (payload: PlayerPayload) => {
    //
    // TODO
    //
    console.log("Emit to clients");
  },
  "player:left": (payload: PlayerPayload) => {
    //
    // TODO
    //
    console.log("Emit to clients");
  },
};

//
// Step: Initialize transport
//

const httpServer = createServer();
const socketServer = new SocketServer(httpServer);

socketServer.on("connection", (socket) => {
  //
  // TODO
  //
  Object.keys(commandHandlers).forEach((e) => {
    socket.on(e, (payload) => {
      commandBus.publish(e, payload);
    });
  });

  socketServer.on("disconnect", () => {
    //
    // TODO
    //
  });
});

//
// Step: Run program
//

const PORT = 3001;

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

// =================== //
// === Iteration 2 === //
// =================== //

// TODO: Not sure.
