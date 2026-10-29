import { expect, spyOn, test } from "bun:test";
import { logClientMessage } from "actor-sync/client";
import { logCoreMessage } from "actor-sync/core";
import { logServerMessage } from "actor-sync/server";

test("core export logs its message once", () => {
  const log = spyOn(console, "log");
  try {
    logCoreMessage();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith("Hello from actor-sync/core.");
  } finally {
    log.mockRestore();
  }
});

test("client export logs its message once", () => {
  const log = spyOn(console, "log");
  try {
    logClientMessage();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith("Hello from actor-sync/client.");
  } finally {
    log.mockRestore();
  }
});

test("server export logs its message once", () => {
  const log = spyOn(console, "log");
  try {
    logServerMessage();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith("Hello from actor-sync/server.");
  } finally {
    log.mockRestore();
  }
});

test("each public subpath exports only its demo function", async () => {
  expect(Object.keys(await import("actor-sync/core"))).toEqual(["logCoreMessage"]);
  expect(Object.keys(await import("actor-sync/client"))).toEqual(["logClientMessage"]);
  expect(Object.keys(await import("actor-sync/server"))).toEqual(["logServerMessage"]);
});
