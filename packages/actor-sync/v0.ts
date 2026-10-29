
// // Open questions
// //
// // Should createActor and deleteActor be part of the framework? Yes...
// //  - How does this look in terms of the API?
// //  - Who creates them? The server...
// //
// //

// // ====================== //
// // === Framework Core === //
// // ====================== //

// // === Definitions === //
// type ComponentDefinition = {
//   // TODO
// }

// type ComponentDefinitionMap = {
//   // TODO
// }

// type ActorDefinition = {
//   type: string;
//   components: Record<string, ComponentDefinition>;
// };
// type ActorDefinitionMap = Record<string, ActorDefinition>;

// // === Runtime === //

// type ServerState <TActorMap extends ActorDefinitionMap> = {
//   actors: {
//     'id-123': {
//       id: 'id-123',
//       components: {
//         'input-keyboard': {
//           id: 'input-keyboard',
//           data: {
//             keysDown: [ 'w', 'a' ],
//           }
//         }
//       }
//     }
//   }
// };

// type Actor = {
//   id: string;
//   type: string; // Discriminator
//   components: unknown; // TODO
// }

// type ActorsManager <TActorMap extends ActorDefinitionMap> = {
//   get: (id: string) => Actor;
//   create: <TActorType extends keyof TActorMap>(type: TActorType) => Actor;
//   delete: (id: string) => void;
// }
// // This is given to the handlers? And returned from the factory?
// // How do we get the correct actor definitions here?
// type ServerSyncApi = { 
//   start: () => void;
//   stop: () => void;
//   actors: ActorsManager;
// }

// type Sender = {
//   send: () => void;
// }

// type Listener = {
//   start: () => void;
//   stop: () => void;
// }

// type StateRepository <TConfig extends IServerSyncConfig> = {
//   get: () => ServerState<TConfig>;
//   mutate: (state: ServerState<TConfig>) => ServerState<TConfig>;
// }

// type ServerSyncOptions <TConfig extends IServerSyncConfig> = {
//   definitions: {
//     actors: TConfig['ActorDefinitionMap'];
//     components: TConfig['ComponentDefinitionMap'];
//   };
//   transport: {
//     sender: Sender<TConfig>;
//     receiver: Listener<TConfig>;
//   };
//   storage: {
//     stateRepository: StateRepository<TConfig>;
//   };
// }

// const createServerSync = <TConfig>(options: ServerSyncOptions): ServerSyncApi => {
//   return {
//     start: () => {
//       options.transport.receiver.start();
//     },
//     stop: () => {
//       options.transport.receiver.stop();
//     },
//     actors: {
//       get: (id: string) => {
//         return {  // TODO: Look this up from state.
//           id,
//           type: '', 
//           components: {} 
//         }
//       },
//       create: (type: TActorType) => {
//         const actor = { 
//           id: v4(), 
//           type, 
//           components: {} // TODO: Look this up from actor registry.
//         };

//         // TODO: Set in state.

//         return actor;
//       },
//       delete: (id: string) => {
//         // TODO
//       },
//     }
//   }
// }

// interface IServerSyncConfig {
//   ActorDefinitionMap: ActorDefinitionMap;
//   ComponentDefinitionMap: ComponentDefinitionMap;
// }

// const bootstrapServerSync = () => {
//   return {
//     defineActor: (actorDefinition: TActorDefinition) => {
//       // TODO
//     },
//     defineComponent: (componentDefinition: TComponentDefinition) => {
//       // TODO
//     },
//   }
// }

// // ======================== //
// // === Framework Client === //
// // ======================== //



// // ======================== //
// // === Framework Server === //
// // ======================== //



// // ===================== //
// // === Core Consumer === //
// // ===================== //

// const { defineComponent, defineActor } = bootstrapServerSync();
// const keyboardInput = defineComponent('');


// // ======================= //
// // === Client Consumer === //
// // ======================= //



// // ======================= //
// // === Server Consumer === //
// // ======================= //


// // ===================== //
// // === Brainstorming === //
// // ===================== //
