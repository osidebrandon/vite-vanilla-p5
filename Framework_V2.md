# Framework V2

- Framework that syncs state between two layers (commonly client and server).
- One of these layers (server) will be the authoritative state.

## Framework vs Consumer Scope

### Framework Scope

- Handles creation/deletion of actors.
- Handles adding/removing of components from actors.
- Handles routing to correct command/event handlers.
- Adds correct actor/component/context into the handlers.
- Adds clean API for interacting with actors and components.

### Consumer Scope

Consumer scope will be defined in 2 parts.

1. Consumer app usage

- Consumers will define all possible actors types for the game.
- Consumers will define all possible components for the game.
- Consumers will provide a Sender and Listener for the transport layer.
  - This allows the consumer to choose their transport infrastructure.
- Consumers will be able to listen for side-effect events.
  - This allows the consumer to act off state changes.
    - Ex: Update react.js state within a side-effect.

2. Consumer extension

- Consumers will be able to define own components.
  - This can happen within the consumer app, or within a shared package, etc.

## Open Questions

- How will this work for single room games vs multi-room games?
  - Probably need some sort of adapter in the transport layer.

- How do we emit to multiple clients?
  - Again, probably just an adapter on the transport layer.

- Do the client and server really need different state values?

- Should the client and server emit just the events as side-effects, or should they also emit the commands incoming to the server?
  - I think only events make sense for side-effects.

### Peices of Code

0. There is a difference between an ActorDeclaration and Actor type. Same with ComponentDefinition and Component type.

- The declarations are at static/build time.
- Actual types are held within state at runtime.

1. Component definitions declared statically.

- Components will have a 'client side' and a 'server side' state.

```ts
type HealthClientData = {
  value: number;
};

type HealthServerData = {
  value: number;
};
```

- They will have events for each layer direction (client to server vs server to client).

```ts
type HealthClientToServerCommands = {
  set: { value: number };
  add: { value: number };
  sub: { value: number };
};

type HealthServerToClientEvents = {
  changed: {
    actor: Actor;
    component: Component;
    previous: number;
    value: number;
  };
};
```

- There will be a helper util `defineComponent` that will help with types.
- There will be handlers for each of these commands/events.
- These handlers will have access to the actor, component, and a framework API (undecided yet).
- These events will be used for side-effect listeners.
- The framework api will have an event bus to publish events to.

```ts
const healthComponent = defineComponent<
  HealthClientData,
  HealthClientToServerCommands,
  HealthServerToClientEvents,
  HealthServerData
>("health", {
  commandHandlers: { // Server side commands
    set: (data, context) => {

      // Handle logic for this component command.
      const actor = context.stateApi.getActor(context.actorId);
      const previous = actor.getComponent('health');
      previous.set(data.value); // .set() is for the stateApi, not the set command.

      // Must publish one of the server to client events.
      // Must be '<component_type>:<server_to_client_event>'
      context.eventBus.publish('health:changed', { actorId, component });
    },
    add: (data, context) => {...},
    sub: (data, context) => {...},
  },
  eventHandlers: { // Client side events
    changed: (data, context) => {...},
  },
});
```

2. Actor definitions declared statically.

- There will be a defineActor function to help as a util for building the correct type.
- Actors could possibly start with default components when created, but the default components are optional.

```ts
const playerActor = defineActor("player", [
  {
    type: "health",
    value: 100,
  },
]);
const cameraActor = defineActor("camera", []);
```

3. Client API gets initialized with possible actors and components.

```ts
const actors = [playerActor, cameraActor];
const components = [healthComponent, followComponent];

// This probably needs type parameters.
const clientApi = createClient(actors, components);
```

4. Server API gets initialized with possible actors and components.

Same as client. The reason for the split is because client vs server can possibly live in 2 different projects.

```ts
const actors = [playerActor, cameraActor];
const components = [healthComponent, followComponent];

// This probably needs type parameters.
const serverApi = createServer(actors, components);
```

5. When updates to the state happen, events will be emitted so consumers can have side-effects happen.

```ts
clientApi.on("health:changed", ({ actor, previousValue, newValue }) => {
    healthRef.current = newValue;
});
serverApi.on("health:changed", ({ actor, previousValue, newValue }) => {...});
...
clientApi.off("health:changed", ({ actor, previousValue, newValue }) => {...});
serverApi.off("health:changed", ({ actor, previousValue, newValue }) => {...});
```

6. State is declared based on actor and component definitions. State will be different from client vs server.

Here is a runtime example of client state

```ts
const clientState = {
    actors: {
        'player-0': {
            id: 'player-0',
            type: 'player',
            components: {
                health: {
                    value: 100,
                }
            }
        },
        'player-1': {...}
    }
}
```

7. Client and server have their own API

- Not too sure what these APIs should be.
- Currently I use them in the examples above.

8. The framework has a built in actor dealing with actor creation/deletion.

- This component is in charge of the top level 'actors' property in the state.
- This actor cannot be created/deleted/modified by the handlers.

```ts
type ActorClientToServerCommands = {
  // Must be one of the registered actors.
  // Somehow need to give initial components and values.
  create: { type: string; components?: Component[] };
  delete: { actorId: string };
};

type ActorServerToClientEvents = {
  created: {
    actor: Actor;
  };
  deleted: {
    actor: Actor;
  };
};

const actorComponent = defineComponent();
const actorActor = defineActor();
```

9. The framework has a built in actor dealing with component add/remove.

- This component is in charge of adding/removing components from an actor.
- This actor cannot be created/deleted/modified by the handlers.

```ts
type ComponentClientToServerCommands = {
  // Must be one of the registered actors.
  add: { type: string; component: Component };
  remove: { actorId: string; component: ComponentType };
};

type ComponentServerToClientEvents = {
  added: {
    actor: Actor;
    component: Component;
  };
  removed: {
    actor: Actor;
    component: Component;
  };
};

const componentComponent = defineComponent();
const componentActor = defineActor();
```

10. The framework will have a transport listener for events to transport.

- These will be seperate client vs server since they have the potential to be in different projects.

```ts
// These will probably need type params for strict event and payloads.
const initializeTransport = (eventBus, { sender, receiver }) => {
  return {
    start: () => {
      eventBus.on("health:changed", sender.send);
      etc...
    },
    stop: () => {
      eventBus.off("health:changed", sender.send);
      etc...
    },
  };
};

// These will probably need type params for strict event and payloads.
const clientTransport = initializeTransport(eventBus, { sender, receiver });
const serverTransport = initializeTransport(eventBus, { sender, receiver });

clientTransport.start();
clientTransport.stop();

serverTransport.start();
serverTransport.stop();
```
