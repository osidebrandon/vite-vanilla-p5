import { startLifecycle } from "./lifecycle-core";
import type { TickLifecycleOptions } from "./types";

export function tickLifecycle({
  onStart,
  onStop,
  tickRateMs,
  onTick,
}: TickLifecycleOptions): void {
  startLifecycle({ onStart, onStop }, { tickRateMs, onTick });
}
