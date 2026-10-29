import { createAC, type ComponentSnapshot } from "@ac-state/v1";
import p5 from "p5";
import "./style.css";

type ActorShape = "circle" | "square" | "triangle";
type PingPongComponent = {
  amplitudeRatio: number;
  frequencyHz: number;
};

type ActorComponents = {
  visual: {
    shape: ActorShape;
    position: { x: number; y: number };
    color: string;
  };
  pingPong: PingPongComponent;
};

type InitialActor = {
  id: string;
  components: ComponentSnapshot<ActorComponents>[];
};

const actorComponents = createAC<ActorComponents>();
const initialActors: InitialActor[] = [
  {
    id: "actor-1",
    components: [
      {
        type: "visual",
        shape: "circle",
        position: { x: 0.25, y: 0.5 },
        color: "#e8a4b5",
      },
      {
        type: "pingPong",
        amplitudeRatio: 0.04,
        frequencyHz: 0.8,
      },
    ],
  },
  {
    id: "actor-2",
    components: [
      {
        type: "visual",
        shape: "square",
        position: { x: 0.5, y: 0.5 },
        color: "#a7c7e7",
      },
    ],
  },
  {
    id: "actor-3",
    components: [
      {
        type: "visual",
        shape: "triangle",
        position: { x: 0.75, y: 0.5 },
        color: "#b8d8ba",
      },
    ],
  },
];

actorComponents.initialize(
  actorComponents.createStateSnapshot(
    initialActors.map(({ id, components }) =>
      actorComponents.createActorSnapshot(id, components),
    ),
  ),
);

const ACTOR_SIZE = 100;

const sketch = (canvas: p5) => {
  canvas.setup = () => {
    canvas.createCanvas(window.innerWidth, window.innerHeight);
  };

  canvas.draw = () => {
    canvas.background("#f4f4f0");
    const elapsedSeconds = canvas.millis() / 1000;

    for (const actor of actorComponents.queryActors(() => true)) {
      const visualComponent = actor.getComponent("visual");
      if (!visualComponent) {
        throw new Error(`Actor "${actor.id}" is missing its visual component`);
      }

      const visual = visualComponent.getValue();
      if (!("shape" in visual)) {
        throw new Error(`Actor "${actor.id}" has an invalid visual component`);
      }

      const { shape, position, color } = visual;
      const pingPongComponent = actor.getComponent("pingPong");
      let bobOffset = 0;
      if (pingPongComponent) {
        const pingPong = pingPongComponent.getValue();
        if (!("amplitudeRatio" in pingPong)) {
          throw new Error(`Actor "${actor.id}" has an invalid ping-pong component`);
        }

        bobOffset =
          Math.sin(2 * Math.PI * pingPong.frequencyHz * elapsedSeconds) *
          pingPong.amplitudeRatio *
          canvas.height;
      }
      const x = position.x * canvas.width;
      const y = position.y * canvas.height + bobOffset;

      canvas.push();
      canvas.fill(color);
      canvas.stroke("#222222");
      canvas.strokeWeight(2);

      switch (shape) {
        case "circle":
          canvas.circle(x, y, ACTOR_SIZE);
          break;
        case "square":
          canvas.rectMode(canvas.CENTER);
          canvas.rect(x, y, ACTOR_SIZE, ACTOR_SIZE);
          break;
        case "triangle":
          canvas.triangle(
            x,
            y - ACTOR_SIZE / 2,
            x + ACTOR_SIZE / 2,
            y + ACTOR_SIZE / 2,
            x - ACTOR_SIZE / 2,
            y + ACTOR_SIZE / 2,
          );
          break;
        default:
          throw new Error(`Unsupported actor shape: ${shape}`);
      }

      canvas.pop();
    }
  };

  canvas.windowResized = () => {
    canvas.resizeCanvas(window.innerWidth, window.innerHeight);
    canvas.redraw();
  };
};

const app = document.querySelector<HTMLElement>("#app")!;
const p = new p5(sketch, app);
