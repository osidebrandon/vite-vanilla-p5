import { EventBus, EventsMap, IListener } from "./events";
import { ActorSnapshot } from "./state";

export type CreateFrameworkOptions = {
  actorDefinitions: unknown;
  componentDefinitions: unknown;
};

export interface IServerApi {
  events: IListener<EventsMap>;
  actors: {
    create: (actor: unknown) => void;
    delete: (actorId: string) => void;
  };
  components: {
    add: (actorId: string, component: unknown) => void;
    update: (actorId: string, component: unknown) => void;
    remove: (actorId: string, component: unknown) => void;
  };
}

export const createFramework = <TActorDefinitionsMap, TComponentDefinitionsMap>(
  options: CreateFrameworkOptions,
): IServerApi => {
  const eventBus = new EventBus<EventsMap>();

  return {
    events: {
      on: eventBus.on,
      off: eventBus.off,
    },
    actors: {
      create: (actor: unknown) => {},
      delete: (actorId: string) => {},
    },
    components: {
      add: (actorId: string, component: unknown) => {},
      update: (actorId: string, component: unknown) => {},
      remove: (actorId: string, component: unknown) => {},
    },
  };
};
