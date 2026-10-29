# Framework

Framework that syncs state between client and server.

- This framework uses a component system.

## Flow

1. Component definitions declared statically.

- components have a declaration type, runtime types (client data vs server data), DTO types, and event types.
  - The declaration type contains types, handlers, events for event, etc.
  - The runtime type is the type that is stored in the state on client or server side.
  - The event types are the events/data that can be sent over the wire from client to server and server to client.

```ts
const healthComponent = declareComponent<
  HealthClientData,
  HealthClientToServerData,
  HealthServerToClientData,
  HealthServerData
>("health", {
  onClientSync: (
    {  }: HealthClientData,
    { state, clientApi }: { state: ClientStateApi; clientApi: ClientApi },
  ) => {
    // State has a nice API for handlers.
    const actor =

    // State is mutatable.
    const newState = { health:  };
    state.mutate(newState);

    // Must emit events to client listeners.
    clientApi.effect("component:changed", newState);

    // If needed by component handler, emit to client.
    clientApi.toActor("health:changed", newState);
  },
  onServerSync: (
    component: HealthServerData,
    { state, serverApi }: { state: ServerState; serverApi: ServerApi },
  ) => {
    // State is mutatable.
    const newState = { ...newState };
    state.mutate(newState);

    // Must emit events to client listeners.
    clientApi.emit("component:changed", newState);
  },
});

const componentsMap = {
  healthComponent,
};
```

2. Actor definitions declared statically.

```ts
const playerActor = defineActor("player", ["health"]);
const cameraActor = defineActor("camera", ["follow"]);

const actorsMap = {
  playerActor,
  cameraActor,
};
```

3. Client API gets initialized with possible actors and components.

```ts
const clientApi = initializeClient(actorsMap, componentsMap);
```

4. Server API gets initialized with possible actors and components.

```ts
const serverApi = initializeServer(actorsMap, componentsMap);
```

5. When updates to the state happen, events will be emitted so consumers can have side-effects happen.

Client

```ts
clientApi.on("state:changed", ({ state }) => {});
clientApi.on("actor:created", ({ actor, state }) => {});
clientApi.on("actor:destroyed", ({ actor, state }) => {});
clientApi.on("actor:changed", ({ actor, state }) => {});
clientApi.on("component:added", ({ component, actor, state }) => {});
clientApi.on("component:removed", ({ component, actor, state }) => {});
clientApi.on("component:changed", ({ component, actor, state }) => {});
```

Server

```ts
serverApi.on("state:changed", ({ state }) => {});
serverApi.on("actor:created", ({ actor, state }) => {});
serverApi.on("actor:destroyed", ({ actor, state }) => {});
serverApi.on("actor:changed", ({ actor, state }) => {});
serverApi.on("component:added", ({ component, actor, state }) => {});
serverApi.on("component:removed", ({ component, actor, state }) => {});
serverApi.on("component:changed", ({ component, actor, state }) => {});
```

6. State is declared based on actor and component definitions. State will be different from client vs server.

```ts
const exampleClientState = {
  "player-0": {
    id: "player-0",
    components: {
      health: {
        type: "health",
        value: 100,
      },
    },
  },
};

const exampleServerState = {
  "player-0": {
    id: "player-0",
    components: {
      health: {
        type: "health",
        value: 100,
      },
    },
  },
};
```

7. Client and server have their own API

Client

```ts
const clientApi = initializeClient(...);
clientApi.on('actor:created', (...) => {...});
clientApi.off('actor:created', (...) => {...});
```

Server

```ts
const serverApi = initializeServer(...);
serverApi.on('actor:created', (...) => {...});
serverApi.off('actor:created', (...) => {...});
```
