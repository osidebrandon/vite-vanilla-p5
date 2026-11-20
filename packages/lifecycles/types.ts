export type BaseLifecycleOptions = {
  onStart: () => void;
  onStop: () => void;
};

export type TickLifecycleOptions = BaseLifecycleOptions & {
  tickRateMs: number;
  onTick: () => void;
};
