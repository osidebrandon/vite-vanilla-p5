import type { BaseLifecycleOptions } from "./types";

type TickOptions = {
  tickRateMs: number;
  onTick: () => void;
};

const terminationSignals =
  process.platform === "win32"
    ? (["SIGINT", "SIGTERM", "SIGBREAK"] as const)
    : (["SIGINT", "SIGTERM", "SIGHUP", "SIGQUIT"] as const);

export function startLifecycle(
  { onStart, onStop }: BaseLifecycleOptions,
  tick?: TickOptions,
): void {
  let stopped = false;
  let interval: ReturnType<typeof setInterval> | undefined;

  const stop = (): void => {
    if (stopped) {
      return;
    }

    stopped = true;

    if (interval !== undefined) {
      clearInterval(interval);
      interval = undefined;
    }

    process.removeListener("exit", stop);

    for (const signal of terminationSignals) {
      process.removeListener(signal, stop);
    }

    onStop();
  };

  const invoke = (callback: () => void): void => {
    try {
      callback();
    } catch (error) {
      try {
        stop();
      } catch (cleanupError) {
        throw new AggregateError(
          [error, cleanupError],
          "Lifecycle callback and cleanup both failed",
        );
      }

      throw error;
    }
  };

  for (const signal of terminationSignals) {
    process.once(signal, stop);
  }

  process.once("exit", stop);

  invoke(onStart);

  if (tick && !stopped) {
    invoke(() => {
      interval = setInterval(() => {
        if (!stopped) {
          invoke(tick.onTick);
        }
      }, tick.tickRateMs);
    });
  }
}
