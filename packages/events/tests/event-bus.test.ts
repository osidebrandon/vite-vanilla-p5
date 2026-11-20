import { expect, test } from "bun:test";
import { EventBus } from "../index.ts";

type TestEvents = {
  "actor:created": { actorId: string };
  "actor:destroyed": { actorId: string };
};

test("publishes events only to listeners of that event", () => {
  const eventBus = new EventBus<TestEvents>();
  const created: TestEvents["actor:created"][] = [];
  const destroyed: TestEvents["actor:destroyed"][] = [];

  eventBus.on("actor:created", (event) => created.push(event));
  eventBus.on("actor:destroyed", (event) => destroyed.push(event));
  eventBus.publish("actor:created", { actorId: "player-0" });

  expect(created).toEqual([{ actorId: "player-0" }]);
  expect(destroyed).toEqual([]);
});

test("stops calling listeners removed with off", () => {
  const eventBus = new EventBus<TestEvents>();
  let calls = 0;
  const listener = () => {
    calls += 1;
  };

  eventBus.on("actor:created", listener);
  eventBus.publish("actor:created", { actorId: "player-0" });
  eventBus.off("actor:created", listener);
  eventBus.publish("actor:created", { actorId: "player-1" });

  expect(calls).toBe(1);
});

test("keeps methods bound when detached from the bus", () => {
  const { on, off, publish } = new EventBus<TestEvents>();
  const created: TestEvents["actor:created"][] = [];
  const listener = (event: TestEvents["actor:created"]) => {
    created.push(event);
  };

  on("actor:created", listener);
  publish("actor:created", { actorId: "player-0" });
  off("actor:created", listener);
  publish("actor:created", { actorId: "player-1" });

  expect(created).toEqual([{ actorId: "player-0" }]);
});

test("notifies onAny listeners after event-specific listeners", () => {
  const bus = new EventBus<TestEvents>();
  const calls: string[] = [];

  bus.on("actor:created", (event) => {
    calls.push(`specific:${event.actorId}`);
  });
  bus.onAny((eventName, payload) => {
    calls.push(`${eventName}:${payload.actorId}`);
  });

  bus.publish("actor:created", { actorId: "player-0" });
  bus.publish("actor:destroyed", { actorId: "player-1" });

  expect(calls).toEqual([
    "specific:player-0",
    "actor:created:player-0",
    "actor:destroyed:player-1",
  ]);
});

test("offAll removes event-specific and onAny listeners", () => {
  const { on, onAny, offAll, publish } = new EventBus<TestEvents>();
  const calls: string[] = [];

  on("actor:created", () => {
    calls.push("specific");
  });
  onAny(() => {
    calls.push("any");
  });

  publish("actor:created", { actorId: "player-0" });
  offAll();
  publish("actor:created", { actorId: "player-1" });

  expect(calls).toEqual(["specific", "any"]);
});
