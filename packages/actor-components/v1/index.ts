import { EventBus } from "@events";

// Snapshot data is expected to be JSON-compatible.
const cloneJson = <TValue>(value: TValue): TValue => {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new TypeError("Snapshot values must be JSON-serializable.");
  }

  return JSON.parse(serialized) as TValue;
};

type ComponentTypeKey<TComponents extends ComponentsBase> = Extract<
  keyof TComponents,
  string
>;

export type AC<TComponents extends ComponentsBase> = {
  //
  // Events
  //

  on: EventBus<FrameworkEvents<TComponents>>["on"];
  off: EventBus<FrameworkEvents<TComponents>>["off"];
  createEventHandler: <TEvent extends ActorEvent | ComponentEvent>(
    cb: (event: EventPayload<TEvent, TComponents>) => void | Promise<void>,
  ) => (event: EventPayload<TEvent, TComponents>) => void | Promise<void>;

  //
  // Helpers
  //

  createStateSnapshot: (
    actors: ActorSnapshot<TComponents>[],
  ) => StateSnapshot<TComponents>;
  createActorSnapshot: (
    actorId: string,
    components: ComponentSnapshot<TComponents>[],
  ) => ActorSnapshot<TComponents>;

  //
  // Initialization
  //

  initialize: (snapshot: StateSnapshot<TComponents>) => void;

  //
  // State API
  //

  // Actors
  getActor: (actorId: string) => Actor<TComponents> | undefined;
  queryActors: (
    predicate: (actor: Actor<TComponents>) => boolean,
  ) => Actor<TComponents>[];
  spawnActor: (actor: ActorSnapshot<TComponents>) => Actor<TComponents>;
  destroyActor: (actorId: string) => Actor<TComponents> | undefined;

  // Components
  queryComponents: (
    predicate: (
      component: Component<TComponents>,
      actor: Actor<TComponents>,
    ) => boolean,
  ) => Component<TComponents>[];
};

export class Actor<TComponents extends ComponentsBase> {
  public id: string;
  public components: Partial<
    Record<ComponentTypeKey<TComponents>, Component<TComponents>>
  >;

  constructor(
    snapshot: ActorSnapshot<TComponents>,
    private readonly eventBus: EventBus<FrameworkEvents<TComponents>> =
      new EventBus<FrameworkEvents<TComponents>>(),
  ) {
    this.id = snapshot.id;

    const components: Partial<
      Record<ComponentTypeKey<TComponents>, Component<TComponents>>
    > = Object.create(null);

    for (const componentSnapshot of Object.values(snapshot.components)) {
      const type = componentSnapshot.type;
      if (Object.prototype.hasOwnProperty.call(components, type)) {
        throw new Error(
          `Actor "${this.id}" has duplicate component type "${String(type)}".`,
        );
      }

      components[type] = new Component<TComponents>(
        componentSnapshot,
        this,
        this.eventBus,
      );
    }

    this.components = components;
  }

  snapshot = (): ActorSnapshot<TComponents> => {
    const components = Object.create(null) as ActorSnapshot<TComponents>["components"];

    for (const [type, component] of Object.entries(this.components)) {
      if (component) {
        components[type] = component.snapshot();
      }
    }

    return { id: this.id, components };
  };

  getComponent = (
    type: ComponentTypeKey<TComponents>,
  ): Component<TComponents> | undefined => {
    return this.components[type];
  };

  queryComponents = (
    predicate: (
      component: Component<TComponents>,
      actor: Actor<TComponents>,
    ) => boolean,
  ): Component<TComponents>[] => {
    const components: Component<TComponents>[] = [];

    for (const component of Object.values(this.components)) {
      if (component && predicate(component, this)) {
        components.push(component);
      }
    }

    return components;
  };

  addComponent = (
    componentSnapshot: ComponentSnapshot<TComponents>,
  ): Component<TComponents> => {
    const type = componentSnapshot.type;
    if (Object.prototype.hasOwnProperty.call(this.components, type)) {
      throw new Error(
        `Actor "${this.id}" already has component "${String(type)}".`,
      );
    }

    const component = new Component<TComponents>(
      componentSnapshot,
      this,
      this.eventBus,
    );

    this.components[type] = component;
    this.eventBus.publish("component:added", {
      actor: this.snapshot(),
      component: component.snapshot(),
    });

    return component;
  };

  removeComponent = (
    type: ComponentTypeKey<TComponents>,
  ): Component<TComponents> | undefined => {
    const component = this.components[type];
    if (!component) {
      return undefined;
    }

    delete this.components[type];
    this.eventBus.publish("component:removed", {
      actor: this.snapshot(),
      component: component.snapshot(),
    });

    return component;
  };
}

export class Component<
  TComponents extends ComponentsBase,
  TComponentType extends ComponentTypeKey<TComponents> = ComponentTypeKey<TComponents>,
  TComponentData extends TComponents[TComponentType] = TComponents[TComponentType],
> {
  private _value: TComponentData;
  private readonly componentType: TComponentType;

  constructor(
    snapshot: ComponentSnapshot<TComponents, TComponentType>,
    private readonly actor: Actor<TComponents>,
    private readonly eventBus: EventBus<FrameworkEvents<TComponents>>,
  ) {
    const { type, ...value } = snapshot;
    this.componentType = type;
    this._value = value as TComponentData;
  }

  snapshot = (): ComponentSnapshot<TComponents, TComponentType> => {
    return cloneJson({
      ...this._value,
      type: this.componentType,
    }) as ComponentSnapshot<TComponents, TComponentType>;
  };

  getValue = (): TComponentData => {
    return this._value;
  };

  setValue = (value: TComponentData): void => {
    this._value = value;

    this.eventBus.publish("component:changed", {
      actor: this.actor.snapshot(),
      component: this.snapshot(),
    });
  };

  remove = (): void => {
    this.actor.removeComponent(this.componentType);
  };
}

export type State<TComponents extends ComponentsBase> = {
  actors: Record<string, Actor<TComponents>>;
};

declare const actorEventFamily: unique symbol;
declare const componentEventFamily: unique symbol;

export type ActorEvent = { readonly [actorEventFamily]: true };

export type ComponentEvent = { readonly [componentEventFamily]: true };

export type ActorEventPayload<TComponents extends ComponentsBase> = {
  actor: ActorSnapshot<TComponents>;
};

export type ComponentEventPayload<TComponents extends ComponentsBase> = {
  actor: ActorSnapshot<TComponents>;
  component: ComponentSnapshot<TComponents>;
};

type EventPayload<
  TEvent extends ActorEvent | ComponentEvent,
  TComponents extends ComponentsBase,
> = TEvent extends ActorEvent
  ? ActorEventPayload<TComponents>
  : ComponentEventPayload<TComponents>;

export type ComponentsBase = Record<string, object>;

export type FrameworkEvents<TComponents extends ComponentsBase> = {
  "actor:spawned": ActorEventPayload<TComponents>;
  "actor:destroyed": ActorEventPayload<TComponents>;
  "component:added": ComponentEventPayload<TComponents>;
  "component:changed": ComponentEventPayload<TComponents>;
  "component:removed": ComponentEventPayload<TComponents>;
};

export type StateSnapshot<TComponents extends ComponentsBase> = {
  actors: Record<string, ActorSnapshot<TComponents>>;
};

export type ActorSnapshot<TComponents extends ComponentsBase> = {
  id: string;
  components: Record<string, ComponentSnapshot<TComponents>>;
};

export type ComponentSnapshot<
  TComponents extends ComponentsBase,
  TComponentType extends ComponentTypeKey<TComponents> = ComponentTypeKey<TComponents>,
> = {
  [K in TComponentType]: { type: K } & TComponents[K];
}[TComponentType];

export const createAC = <
  TComponents extends ComponentsBase,
>(): AC<TComponents> => {
  const eventBus = new EventBus<FrameworkEvents<TComponents>>();
  const state: State<TComponents> = { actors: Object.create(null) };

  return {
    //
    // Initialization
    //
    initialize: ({ actors }: StateSnapshot<TComponents>) => {
      const initializedActors = Object.create(null) as State<
        TComponents
      >["actors"];

      for (const actorSnapshot of Object.values(actors)) {
        if (
          Object.prototype.hasOwnProperty.call(
            initializedActors,
            actorSnapshot.id,
          )
        ) {
          throw new Error(
            `Duplicate actor ID "${actorSnapshot.id}" in state snapshot.`,
          );
        }

        initializedActors[actorSnapshot.id] = new Actor(
          actorSnapshot,
          eventBus,
        );
      }

      state.actors = initializedActors;
    },

    //
    // Snapshots
    //
    createStateSnapshot: (actors: ActorSnapshot<TComponents>[]) => {
      const actorSnapshots = Object.create(null) as StateSnapshot<
        TComponents
      >["actors"];

      for (const actorSnapshot of actors) {
        if (
          Object.prototype.hasOwnProperty.call(
            actorSnapshots,
            actorSnapshot.id,
          )
        ) {
          throw new Error(
            `Duplicate actor ID "${actorSnapshot.id}" in state snapshot.`,
          );
        }

        actorSnapshots[actorSnapshot.id] = actorSnapshot;
      }

      return { actors: actorSnapshots };
    },
    createActorSnapshot: (
      actorId: string,
      components: ComponentSnapshot<TComponents>[],
    ) => {
      const actorComponents = Object.create(null) as ActorSnapshot<
        TComponents
      >["components"];

      for (const componentSnapshot of components) {
        const type = componentSnapshot.type;
        if (Object.prototype.hasOwnProperty.call(actorComponents, type)) {
          throw new Error(
            `Duplicate component type "${String(type)}" for actor "${actorId}".`,
          );
        }

        actorComponents[type] = componentSnapshot;
      }

      return {
        id: actorId,
        components: actorComponents,
      };
    },

    //
    // Actors
    //
    getActor: (actorId: string) => {
      return state.actors[actorId];
    },
    queryActors: (predicate: (actor: Actor<TComponents>) => boolean) => {
      return Object.values(state.actors).filter(predicate);
    },
    spawnActor: (actorSnapshot: ActorSnapshot<TComponents>) => {
      if (Object.prototype.hasOwnProperty.call(state.actors, actorSnapshot.id)) {
        throw new Error(`Actor "${actorSnapshot.id}" already exists.`);
      }

      const actor = new Actor(actorSnapshot, eventBus);
      state.actors[actor.id] = actor;
      eventBus.publish("actor:spawned", { actor: actor.snapshot() });
      return actor;
    },
    destroyActor: (actorId: string) => {
      const actor = state.actors[actorId];

      if (actor) {
        delete state.actors[actorId];
        eventBus.publish("actor:destroyed", { actor: actor.snapshot() });
      }

      return actor;
    },

    //
    // Components
    //
    queryComponents: (
      predicate: (
        component: Component<TComponents>,
        actor: Actor<TComponents>,
      ) => boolean,
    ) => {
      return Object.values(state.actors).reduce<Component<TComponents>[]>(
        (acc, actor) => {
          Object.values(actor.components).forEach((component) => {
            if (component && predicate(component, actor)) {
              acc.push(component);
            }
          });
          return acc;
        },
        [],
      );
    },

    //
    // Events
    //
    on: eventBus.on,
    off: eventBus.off,
    createEventHandler: <TEvent extends ActorEvent | ComponentEvent>(
      callback: (
        event: EventPayload<TEvent, TComponents>,
      ) => void | Promise<void>,
    ) => callback,
  };
};
