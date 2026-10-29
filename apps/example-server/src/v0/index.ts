/* === Server Consumer API ===

- Consumer provides component definitions.
- Consumer provides actors definitions.
- Consumer provides transport.
- Consumer creates the framework API.
- Consumer listens for side-effects (optional).
- Consumer starts the program.

*/

import { createServer } from "node:http";
import { Server } from "socket.io";
import { SocketIOTransport } from "actor-sync/server/transport";
import { createServerApi } from "actor-sync/server";

// === Consumer provides component definitions === //

const healthComponentDefinition = {};

const componentDefinitions = [healthComponentDefinition];

// === Consumer provides actor definitions === //

const playerActorDefinition = {};

const actorDefinitions = [playerActorDefinition];

// === Consumer provides transport === //

const httpServer = createServer();
const ioServer = new Server(httpServer, {
  cors: { origin: "*" },
});

const transport = new SocketIOTransport(ioServer);

// === Consumer creates framework API === //

const serverApi = createServerApi({
  actorDefinitions,
  componentDefinitions,
  transport,
});

// === Consumer listens for side-effects === //

serverApi.on("actor:created", (event) => {
  console.log(`[Consumer actor:created] ${JSON.stringify(event)}`);
});
serverApi.on("actor:deleted", (event) => {
  console.log(`[Consumer actor:deleted] ${JSON.stringify(event)}`);
});
serverApi.on("component:added", (event) => {
  console.log(`[Consumer component:added] ${JSON.stringify(event)}`);
});
serverApi.on("component:changed", (event) => {
  console.log(`[Consumer component:changed] ${JSON.stringify(event)}`);
});
serverApi.on("component:removed", (event) => {
  console.log(`[Consumer component:removed] ${JSON.stringify(event)}`);
});

// === Consumer starts the program === //

httpServer.listen(3001, () => {
  console.log(`Server running at localhost:3001`);
});

// TODO: serverApi.off()
