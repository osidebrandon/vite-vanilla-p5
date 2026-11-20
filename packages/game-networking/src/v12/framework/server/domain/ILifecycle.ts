export interface ILifecycle {
  start: () => void | Promise<void>;
  stop: () => void | Promise<void>;
}
