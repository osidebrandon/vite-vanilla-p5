import { lifecycle } from "@lifecycles";
import { ActorEvent, ComponentEvent, createAC } from "@ac-state/v1";

type MyComponents = {
  name: { name: string };
  health: { current: number; max: number };
};

const ac = createAC<MyComponents>();

ac.initialize(
  ac.createStateSnapshot([
    ac.createActorSnapshot("player-0", [
      { type: "name", name: "Brandon" },
      { type: "health", current: 100, max: 100 },
    ]),
  ]),
);

const onActorCreated = ac.createEventHandler<ActorEvent>((event) => {
  const nameComponent = event.actor.components["name"];
  if (nameComponent.type === "name") {
    console.log(nameComponent.name);
  }
  console.log(event);
});

const onActorDestroyed = ac.createEventHandler<ActorEvent>((event) => {
  console.log(event);
});

const onComponentAdded = ac.createEventHandler<ComponentEvent>((event) => {
  if (event.component.type === "health") {
    console.log(event.component.current, event.component.max);
  }
  console.log(event);
});

const onComponentChanged = ac.createEventHandler<ComponentEvent>((event) => {
  console.log(event);
});

const onComponentRemoved = ac.createEventHandler<ComponentEvent>((event) => {
  console.log(event);
});

lifecycle({
  onStart: () => {
    ac.on("actor:spawned", onActorCreated);
    ac.on("actor:destroyed", onActorDestroyed);
    ac.on("component:added", onComponentAdded);
    ac.on("component:changed", onComponentChanged);
    ac.on("component:removed", onComponentRemoved);

    const actor = ac.spawnActor(
      ac.createActorSnapshot("player-1", [{ type: "name", name: "Whitney" }]),
    );
    const nameComponent = actor.getComponent("name");
    console.log(nameComponent?.getValue(), nameComponent?.snapshot());

    const healthComponent = actor.addComponent({
      type: "health",
      current: 100,
      max: 100,
    });
    healthComponent.setValue({ current: 90, max: 100 });

    console.log(actor.snapshot());
    console.log(
      actor.queryComponents(
        (component) => component.snapshot().type === "health",
      ),
    );
    console.log(ac.getActor(actor.id));
    console.log(
      ac.queryActors((candidate) => candidate.id.startsWith("player-")),
    );
    console.log(
      ac.queryComponents(
        (component) => component.snapshot().type === "health",
      ),
    );
    console.log(
      ac.createStateSnapshot(
        ac.queryActors(() => true).map((candidate) => candidate.snapshot()),
      ),
    );

    actor.removeComponent("name");
    healthComponent.remove();
    ac.destroyActor(actor.id);
    console.log(ac.getActor(actor.id));
  },
  onStop: () => {
    ac.off("actor:spawned", onActorCreated);
    ac.off("actor:destroyed", onActorDestroyed);
    ac.off("component:added", onComponentAdded);
    ac.off("component:changed", onComponentChanged);
    ac.off("component:removed", onComponentRemoved);
  },
});
