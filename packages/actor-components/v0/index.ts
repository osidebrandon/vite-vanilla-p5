export type ActorSnapshot = {
  id: string;
  type: TActorType;
  components: Record<TComponentType, ComponentSnapshot>;
};

export type ComponentSnapshot = {
  type: string; // Descriminator.
};

export type StateSnapshot = {
  // TODO
};

interface IStateRepository {
  get: () => StateSnapshot;

  // === Actors === //

  getActor: (actorId: string) => ActorSnapshot;

  createActor: (
    actorType: TActorType,
    components?: Record<TComponentName, ComponentSnapshot>,
  ) => boolean;

  deleteActor: (actorId: string) => ActorSnapshot;

  // === Components === //
}

const state = {
  actors: {
    "player-0": {
      id: "player-0",
      type: "player",
      components: {
        stats: {
          type: "stats",
          health: 100,
          money: 500,
          energy: 50,
        },
        follow: {
          type: "follow",
          target: "player-1",
          speed: 10,
        },
      },
    },
  },
};
