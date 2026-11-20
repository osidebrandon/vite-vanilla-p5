import { startLifecycle } from "./lifecycle-core";
import type { BaseLifecycleOptions } from "./types";

export function basicLifecycle(options: BaseLifecycleOptions): void {
  startLifecycle(options);
}
