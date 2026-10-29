
// === Components === //

type ComponentDefinition = {
    type: string; // Discriminator.
    clientData: unknown; // Stored in client state.
    clientToServerData: unknown; // DTO from client -> server.
    serverToClientData: unknown; // DTO from server -> client.
    serverData: unknown; // Stored in server state.
    clientSync: (data: unknown, context: unknown) => void;
    serverSync: (data: unknown, context: unknown) => void;
}

// Helper to create the component definition.
const defineComponent = (type: string, { clientSync, serverSync }): ComponentDefinition => {

}

// === Client API === //

type Actor = {
    id: string;
    type: string; // Definition type. Discriminator.
    components: {
        [type: string]: Component;
    }
};

// This depends on client vs server data.
type Component <TData extends object> = TData & {
    type: string; // Definition type.
}

// This type params will differ depending on client vs server layer.
type State <
    TActorDefinitions extends ActorDefinitionMap, 
    TComponentDefinitions extends ComponentDefinitionMap
> = {
    actors: {
        [id: string]: Actor;
    };
}

// This type params will differ depending on client vs server layer.
export type EventMap <> = {
    'state:updated': { state: TState; };
    'actor:added': { actor: TActor; state: TState; };
    'actor:removed': { actor: TActor; state: TState; };
    'actor:updated': { actor: TActor; state: TState; };
    'component:added': { component: TComponent; actor: TActor; state: TState; };
    'component:removed': { component: TComponent; actor: TActor; state: TState; };
    'component:updated': { component: TComponent; actor: TActor; state: TState; };
}

// const createclientApi = () => {
//     return {
//         on,
//         off,
//     }
// }


// === Client/Server Consumer Side-Effects === //
//
// - We need this outside of the handlers.
// - For react state updates, etc.
// - We will use an event bus!
// - We do this because we cant declare components statically along with registering on change handlers at runtime.
//
// Open Questions:
// - Do we need access to the full state directly?
// - Can i just always use this event system?

// const clientApi = createClientApi();
// clientApi.on('state:updated', ({ state }) => {});
// clientApi.on('actor:added', ({ actor, state }) => {});
// clientApi.on('actor:removed', ({ actor, state }) => {});
// clientApi.on('component:added', ({ actor, component, state }) => {});
// clientApi.on('component:removed', ({ actor, component, state }) => {});
// clientApi.on('component:updated', ({ actor, component, state }) => {});

// const serverApi = createServerApi();
// serverApi.on('state:updated', ({ state }) => {});
// serverApi.on('actor:added', ({ actor, state }) => {});
// serverApi.on('actor:removed', ({ actor, state }) => {});
// serverApi.on('component:added', ({ actor, component, state }) => {});
// serverApi.on('component:removed', ({ actor, component, state }) => {});
// serverApi.on('component:updated', ({ actor, component, state }) => {});


