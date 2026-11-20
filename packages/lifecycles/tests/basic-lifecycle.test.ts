import { expect, test } from "bun:test";
import { basicLifecycle } from "../index.ts";

const terminationSignals =
  process.platform === "win32"
    ? (["SIGINT", "SIGTERM", "SIGBREAK"] as const)
    : (["SIGINT", "SIGTERM", "SIGHUP", "SIGQUIT"] as const);

function invokeNewListener(
  event: NodeJS.Signals | "exit",
  previousListeners: readonly Function[],
): void {
  const listener = process
    .listeners(event)
    .find((candidate) => !previousListeners.includes(candidate));

  if (listener) {
    Reflect.apply(listener, process, []);
  }
}

test("starts immediately and stops once after a termination signal", () => {
  const previousListeners = new Map(
    terminationSignals.map((signal) => [signal, process.listeners(signal)]),
  );
  const previousExitListeners = process.listeners("exit");
  let startCalls = 0;
  let stopCalls = 0;

  try {
    const result = basicLifecycle({
      onStart: () => {
        startCalls += 1;
      },
      onStop: () => {
        stopCalls += 1;
      },
    });

    expect(result).toBeUndefined();
    expect(startCalls).toBe(1);

    const signalListener = process
      .listeners("SIGINT")
      .find((listener) => !previousListeners.get("SIGINT")?.includes(listener));
    expect(signalListener).toBeDefined();

    if (signalListener) {
      Reflect.apply(signalListener, process, []);
    }

    expect(stopCalls).toBe(1);

    for (const signal of terminationSignals) {
      expect(
        process
          .listeners(signal)
          .some(
            (listener) => !previousListeners.get(signal)?.includes(listener),
          ),
      ).toBe(false);
    }

    expect(process.listeners("exit")).toEqual(previousExitListeners);

    if (signalListener) {
      Reflect.apply(signalListener, process, []);
    }
    expect(stopCalls).toBe(1);
  } finally {
    for (const signal of terminationSignals) {
      invokeNewListener(signal, previousListeners.get(signal) ?? []);
    }
  }
});

test("stops on normal process exit", () => {
  const previousExitListeners = process.listeners("exit");
  let stopCalls = 0;

  try {
    basicLifecycle({
      onStart: () => {},
      onStop: () => {
        stopCalls += 1;
      },
    });

    const exitListener = process
      .listeners("exit")
      .find((listener) => !previousExitListeners.includes(listener));
    expect(exitListener).toBeDefined();

    if (exitListener) {
      Reflect.apply(exitListener, process, []);
    }

    expect(stopCalls).toBe(1);
    expect(process.listeners("exit")).toEqual(previousExitListeners);
  } finally {
    invokeNewListener("exit", previousExitListeners);
  }
});

test("runs cleanup and rethrows when onStart throws", () => {
  const previousListeners = new Map(
    terminationSignals.map((signal) => [signal, process.listeners(signal)]),
  );
  const previousExitListeners = process.listeners("exit");
  const startError = new Error("start failed");
  let stopCalls = 0;
  let thrown: unknown;

  try {
    basicLifecycle({
      onStart: () => {
        throw startError;
      },
      onStop: () => {
        stopCalls += 1;
      },
    });
  } catch (error) {
    thrown = error;
  } finally {
    for (const signal of terminationSignals) {
      invokeNewListener(signal, previousListeners.get(signal) ?? []);
    }
    invokeNewListener("exit", previousExitListeners);
  }

  expect(thrown).toBe(startError);
  expect(stopCalls).toBe(1);
  expect(process.listeners("exit")).toEqual(previousExitListeners);

  for (const signal of terminationSignals) {
    expect(
      process
        .listeners(signal)
        .some((listener) => !previousListeners.get(signal)?.includes(listener)),
    ).toBe(false);
  }
});

test("aggregates startup and cleanup errors", () => {
  const previousListeners = new Map(
    terminationSignals.map((signal) => [signal, process.listeners(signal)]),
  );
  const previousExitListeners = process.listeners("exit");
  const startError = new Error("start failed");
  const stopError = new Error("stop failed");
  let thrown: unknown;

  try {
    basicLifecycle({
      onStart: () => {
        throw startError;
      },
      onStop: () => {
        throw stopError;
      },
    });
  } catch (error) {
    thrown = error;
  } finally {
    for (const signal of terminationSignals) {
      invokeNewListener(signal, previousListeners.get(signal) ?? []);
    }
    invokeNewListener("exit", previousExitListeners);
  }

  expect(thrown).toBeInstanceOf(AggregateError);
  if (thrown instanceof AggregateError) {
    expect(thrown.errors).toEqual([startError, stopError]);
  }
});
