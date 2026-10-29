import { expect, test } from "bun:test";
import { getComponentTypeLabel } from "..";

test("getComponentTypeLabel prefixes the component type", () => {
  expect(getComponentTypeLabel("health")).toBe("component:health");
});
