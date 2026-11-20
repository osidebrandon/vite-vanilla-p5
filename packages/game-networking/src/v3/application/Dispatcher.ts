import { Context } from "..";
import { IDispatcher } from "../domain/IDispatcher";
import { ISender } from "../domain/ISender";
import { createLogger } from "../logging";

type Handler<TPayload> = (payload: TPayload, context: Context) => void;
type HandlerMap<TEvents extends object> = {
  [TName in keyof TEvents]: Handler<TEvents[TName]>;
};

//
// Gets called by infrastructure.
// This is the bridge between transport <---> application.
//
export class Dispatcher<
  TEvents extends object,
> implements IDispatcher<TEvents> {
  private _logger = createLogger("DISPATCHER");

  constructor(
    private readonly handlers: HandlerMap<TEvents>,
    private readonly sender: ISender,
  ) {}

  publish = <TName extends keyof TEvents>(
    name: TName,
    payload: TEvents[TName],
  ) => {
    const handler = this.handlers[name];

    if (!handler) {
      this._logger.log(`Event does not have handler: ${String(name)}`);
      return;
    }

    try {
      handler(payload, { sender: this.sender });
    } catch (e) {
      this._logger.log(`Handler threw: ${JSON.stringify(e)}`);
    }
  };
}
