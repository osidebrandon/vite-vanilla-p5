import { spawnSync } from "node:child_process";
import { expect, test } from "bun:test";
import { tickLifecycle } from "../index.ts";

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

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test("ticks after the interval and stops ticking after a termination signal", async () => {
  const previousListeners = new Map(
    terminationSignals.map((signal) => [signal, process.listeners(signal)]),
  );
  const previousExitListeners = process.listeners("exit");
  let startCalls = 0;
  let stopCalls = 0;
  let tickCalls = 0;

  try {
    const result = tickLifecycle({
      onStart: () => {
        startCalls += 1;
      },
      onStop: () => {
        stopCalls += 1;
      },
      tickRateMs: 10,
      onTick: () => {
        tickCalls += 1;
      },
    });

    expect(result).toBeUndefined();
    expect(startCalls).toBe(1);
    expect(tickCalls).toBe(0);

    await wait(50);
    expect(tickCalls).toBeGreaterThan(0);

    const signalListener = process
      .listeners("SIGINT")
      .find((listener) => !previousListeners.get("SIGINT")?.includes(listener));
    expect(signalListener).toBeDefined();

    if (signalListener) {
      Reflect.apply(signalListener, process, []);
    }

    const ticksAtStop = tickCalls;
    await wait(30);

    expect(tickCalls).toBe(ticksAtStop);
    expect(stopCalls).toBe(1);
    expect(process.listeners("exit")).toEqual(previousExitListeners);
  } finally {
    for (const signal of terminationSignals) {
      invokeNewListener(signal, previousListeners.get(signal) ?? []);
    }
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
    tickLifecycle({
      onStart: () => {
        throw startError;
      },
      onStop: () => {
        stopCalls += 1;
      },
      tickRateMs: 10,
      onTick: () => {},
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
});

test("stops, cleans up, and rethrows when onTick throws", () => {
  const moduleUrl = JSON.stringify(
    new URL("../index.ts", import.meta.url).href,
  );
  const childScript = `
    import { tickLifecycle } from ${moduleUrl};

    const tickError = new Error("tick failed");
    let stopCalls = 0;
    let tickCalls = 0;
    let uncaughtErrors = 0;

    process.on("uncaughtException", (error) => {
      uncaughtErrors += 1;
      if (error !== tickError) {
        process.exitCode = 1;
      }
    });

    tickLifecycle({
      onStart: () => {},
      onStop: () => {
        stopCalls += 1;
      },
      tickRateMs: 1,
      onTick: () => {
        tickCalls += 1;
        throw tickError;
      },
    });

    setTimeout(() => {
      const succeeded =
        tickCalls === 1 && stopCalls === 1 && uncaughtErrors === 1;
      process.stdout.write(JSON.stringify({ tickCalls, stopCalls, uncaughtErrors }));
      process.exit(succeeded && process.exitCode !== 1 ? 0 : 1);
    }, 50);
  `;
  const result = spawnSync(process.execPath, ["-e", childScript], {
    encoding: "utf8",
    timeout: 1_000,
  });

  expect(result.status).toBe(0);
  expect(result.stdout).toContain(
    JSON.stringify({ tickCalls: 1, stopCalls: 1, uncaughtErrors: 1 }),
  );
});
