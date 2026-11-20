import { ReferenceTransportClient } from "../../client/application/ReferenceTransportClient";
import { EventMapBase } from "../../shared/types";
import { ITransportServer } from "../domain/ITransportServer";

export class ReferenceTransportServer<
  TClientToServer extends EventMapBase,
  TServerToClient extends EventMapBase,
> implements ITransportServer<TClientToServer, TServerToClient> {
  private _client?: ReferenceTransportClient<TClientToServer, TServerToClient>;

  setReferenceTransportClient = (
    client: ReferenceTransportClient<TClientToServer, TServerToClient>,
  ) => {
    this._client = client;
  };

  start = () => {
    // Nothing for this implementation.
  };

  stop = () => {
    // Nothing for this implementation.
  };

  onEvent = <TEvent extends keyof TClientToServer>(
    event: TEvent,
    payload: TClientToServer[TEvent],
  ) => {
    // TODO
  };

  offEvent = <TEvent extends keyof TClientToServer>(
    event: TEvent,
    payload: TClientToServer[TEvent],
  ) => {
    // TODO
  };

  send = <TEvent extends keyof TServerToClient>(
    connectionId: string,
    event: TEvent,
    payload: TServerToClient[TEvent],
  ) => {
    // TODO
  };
}
