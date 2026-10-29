// === FRAMEWORK === //

// Client Consumer Use-cases (Only for render layer knowledge, not from framework)
//
// 1. Rapid state changes.
// 2. Event driven state changes.
//

// Client Consumer
//
// 1. Notified when actor is created/updated/deleted.
// 
//

// Client Consumers
// 1. Should be a clean API for getting actors and components on actors out of state.
//   - const actors: Actor[] = clientApi.getActors();
//   - const actor: Actor | undefined = clientApi.getActor('id-0');
//   - const { id } = actor;
//   - actor.onChange((actor) => {});
//
//   - const component: Component = actor.getComponent('input-keyboard'); // param intelisense
//   - component.onChange((component) => {});
// 
// 2. Should be able to register side-effects on component change.

// Server Consumers
// - Should be able to read the current state.

// === API: Definitions === //

type ComponentDefinition = unknown;
type ComponentDefinitionMap = Record<string, ComponentDefinition>; // TODO: Get rid of string.

type ActorDefinition = unknown;
type ActorDefinitionMap = Record<string, ActorDefinition>; // TODO: Get rid of string.

// === API: Client === //

type ClientState = unknown;
type ClientApi = {
  getState: () => ClientState;
};
type ClientConfig = unknown;
type ClientOptions = {
  actors: ActorDefinitionMap;
  components: ComponentDefinitionMap;
}
const initClientSync = <TConfig extends ClientConfig>({ actors, components }: ClientOptions): ClientApi => {
  // TODO: Setup listeners.
  // TODO: Setup API.

  return {
    getState: () => 'TODO',
  }
}























// API: Server

type ServerApi = {
  // TODO
}
type ServerConfig = {
  // TODO
}
type ServerOptions = {
  actors: unknown;
  components: unknown;
}
const initServerSync = <TConfig extends ServerConfig>({ actors, components }: ServerOptions) => {
  // TODO
}













// === CONSUMER === //
type KeyboardInputClientData = { keys: [] }
type KeyboardInputClientToServerData = { keys: [] }
type KeyboardInputServerToClientData = { keys: [] }
type KeyboardInputServerData = { keys: [] }
