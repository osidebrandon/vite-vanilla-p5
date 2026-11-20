import { basicLifecycle } from "@lifecycles";
import { createAC, createTemplateWrapper } from "@ac-state/v2";
import type {
  ActorEvent,
  ComponentEvent,
  TemplateDefinitionMap,
} from "@ac-state/v2";

type MyComponents = {
  name: { name: string };
  health: { current: number; max: number };
  mood: { value: string };
};

type ActorMetadata = {
  type: "player" | "npc";
  faction: string;
};

const templates = {
  player: [
    { type: "name", name: "Template player" },
    { type: "health", current: 100, max: 100 },
  ],
  npc: [
    { type: "name", name: "Template NPC" },
    { type: "health", current: 40, max: 40 },
  ],
} as const;

const metadataFreeAC = createAC<MyComponents>();
const metadataFreeActor = metadataFreeAC.spawnActor(
  metadataFreeAC.createActorSnapshot("metadata-free", [
    { type: "name", name: "Local actor" },
  ]),
);
console.log(metadataFreeActor.snapshot());

const ac = createAC<MyComponents, ActorMetadata>();
const templateActors = createTemplateWrapper(ac, templates);

ac.initialize(
  ac.createStateSnapshot([
    ac.createActorSnapshot(
      "player-0",
      [
        { type: "name", name: "Initial player" },
        { type: "health", current: 100, max: 100 },
      ],
      { type: "player", faction: "blue" },
    ),
  ]),
);

const onActorSpawned = ac.createEventHandler<ActorEvent>(({ actor }) => {
  console.log("Actor spawned", actor.id, actor.metadata.type);
});

const onActorChanged = ac.createEventHandler<ActorEvent>(({ actor }) => {
  console.log("Actor metadata changed", actor.id, actor.metadata);
});

const onActorDestroyed = ac.createEventHandler<ActorEvent>(({ actor }) => {
  console.log("Actor destroyed", actor.id);
});

const onComponentAdded = ac.createEventHandler<ComponentEvent>(
  ({ actor, component }) => {
    console.log("Component added", actor.id, component.type);
  },
);

const onComponentChanged = ac.createEventHandler<ComponentEvent>(
  ({ actor, component }) => {
    console.log("Component changed", actor.id, component.type);
  },
);

const onComponentRemoved = ac.createEventHandler<ComponentEvent>(
  ({ actor, component }) => {
    console.log("Component removed", actor.id, component.type);
  },
);

basicLifecycle({
  onStart: () => {
    ac.on("actor:spawned", onActorSpawned);
    ac.on("actor:changed", onActorChanged);
    ac.on("actor:destroyed", onActorDestroyed);
    ac.on("component:added", onComponentAdded);
    ac.on("component:changed", onComponentChanged);
    ac.on("component:removed", onComponentRemoved);

    const player = templateActors.spawnFromTemplate("player", {
      id: "player-1",
      metadata: { type: "npc", faction: "red" },
      componentOverrides: [{ type: "health", current: 75, max: 100 }],
    });

    const directActor = ac.spawnActor(
      ac.createActorSnapshot(
        "npc-direct",
        [{ type: "name", name: "Directly spawned NPC" }],
        { type: "npc", faction: "green" },
      ),
    );

    const nameComponent = player.getComponent("name");
    console.log(nameComponent?.getValue(), nameComponent?.snapshot());
    console.log(player.snapshot());

    const healthComponent = player.getComponent("health");
    healthComponent?.setValue({ current: 60, max: 100 });
    console.log(
      player.queryComponents(
        (component) => component.snapshot().type === "health",
      ),
    );

    const moodComponent = player.addComponent({
      type: "mood",
      value: "focused",
    });
    console.log(moodComponent.getValue(), moodComponent.snapshot());
    moodComponent.setValue({ value: "resting" });
    moodComponent.remove();
    player.removeComponent("name");

    player.setMetadata({ type: "player", faction: "blue" });

    console.log(ac.getActor(player.id));
    console.log(
      ac.queryActors((candidate) => candidate.metadata.type === "player"),
    );
    console.log(
      ac.queryComponents(
        (component, actor) =>
          actor.metadata.type === "player" &&
          component.snapshot().type === "health",
      ),
    );
    console.log(
      ac.createStateSnapshot(
        ac.queryActors(() => true).map((actor) => actor.snapshot()),
      ),
    );

    ac.destroyActor(directActor.id);
    console.log(ac.getActor(directActor.id));
    ac.destroyActor(player.id);
  },
  onStop: () => {
    ac.off("actor:spawned", onActorSpawned);
    ac.off("actor:changed", onActorChanged);
    ac.off("actor:destroyed", onActorDestroyed);
    ac.off("component:added", onComponentAdded);
    ac.off("component:changed", onComponentChanged);
    ac.off("component:removed", onComponentRemoved);
  },
});
