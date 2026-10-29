import { IListener } from "../core/transport";

export type CreateServerApiOptions = {
  actorDefinitions: unknown;
  componentDefinitions: unknown;
  transport: unknown;
};

export interface IServerApi<
  TEventPayloadMap extends Record<string, object>,
> extends IListener<TEventPayloadMap> {}

export const createServerApi = (
  options: CreateServerApiOptions,
): IServerApi => {
  return {
    on: () => {},
    off: () => {},
  };
};

// === Component Definitions === //

type ComponentDefinition = {
  type: string; // Discriminator.
  commands: Record<string, object>; // Client to server.
  events: Record<string, object>; // Server to client.
};

const healthComponentDefinition = {
  type: "health",
  commands: {
    set: { value: 100 },
  },
  // Probably dont need events...
  // This is because we will have framework events such as 'actor:created', 'component:changed', etc
};
