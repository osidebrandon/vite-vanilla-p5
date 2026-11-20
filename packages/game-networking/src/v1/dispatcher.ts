import { EventBus } from "@events";

export type Handler<TEvent, TContext> = (
  event: TEvent,
  context: TContext,
) => void;

export type HandlerMap<TEvents extends Record<string, unknown>, TContext> = {
  [TName in keyof TEvents]: Handler<TEvents[TName], TContext>;
};

export type EventMapBase = Record<string, object>;

/**
 * Routes the correct event to the correct handler with the provided context.
 *
 * @param handlers - The handler map for each event.
 * @param contextFactory - Factory function to create the handler context.
 * @returns The interface for the dispatcher.
 */
export const createDispatcher = <
  TEvents extends EventMapBase,
  TContext extends object,
>(
  handlers: HandlerMap<TEvents, TContext>,
  contextFactory: () => TContext,
) => {
  const intakeBus = new EventBus<TEvents>();

  return {
    publish: intakeBus.publish,

    start: () => {
      intakeBus.onAny((eventName, payload) => {
        try {
          const handler = handlers[eventName];
          handler(payload, contextFactory());
        } catch (e) {
          console.log(`❌ Handler error: ${JSON.stringify(e)}`);
        }
      });
    },

    stop: () => {
      intakeBus.offAll();
    },
  };
};
