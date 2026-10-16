import p5 from "p5";
import "./style.css";

const sketch = (canvas: p5) => {
  canvas.setup = () => {
    canvas.createCanvas(window.innerWidth, window.innerHeight);
    canvas.noLoop();
  };

  canvas.draw = () => {
    canvas.background("#f4f4f0");
    canvas.noStroke();
    canvas.fill("#222222");
    canvas.rectMode(canvas.CENTER);
    canvas.rect(canvas.width / 2, canvas.height / 2, 120, 120);
  };

  canvas.windowResized = () => {
    canvas.resizeCanvas(window.innerWidth, window.innerHeight);
    canvas.redraw();
  };
};

const app = document.querySelector<HTMLElement>("#app")!;
const p = new p5(sketch, app);

// ================================= //

interface IActor {
  id: string;
}

interface IActorManager {
  add: (actor: IActor) => void;
  remove: (actorId: string) => void;
}

interface IWorld {
  readonly actors: IActorManager;

  save: (path: string) => void;
  load: (path: string) => void;

  tick: () => void;
}
