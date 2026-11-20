import { ErrorBase, EventMapBase } from "../../../shared/types";
import { ReferenceTransportServer } from "../../server/application/ReferenceTransportServer";
import { ConnectOptions } from "../domain/IConnector";
import { SendAndWaitOptions } from "../domain/ISender";
import { ConnectedStatus, DisconnectedStatus } from "../domain/IStatusListener";
import { ITransportClient } from "../domain/ITransportClient";

export class ReferenceTransportClient<
  TClientToServer extends EventMapBase,
  TServerToClient extends EventMapBase,
> implements ITransportClient<TClientToServer, TServerToClient> {
  private _server?: ReferenceTransportServer<TClientToServer, TServerToClient>;
  private _eventHandlers: unknown; // TODO
  private _statusHandlers: unknown; // TODO
  private _errorHandlers: unknown; // TODO

  constructor() {}

  setReferenceTransportServer = (
    server: ReferenceTransportServer<TClientToServer, TServerToClient>,
  ) => {
    this._server = server;
  };

  connect = (_options?: ConnectOptions) => {
    // TODO: Call the status handlers with 'connected' type.
    return new Promise<void>((resolve) => resolve());
  };

  disconnect = () => {
    // TODO: Call the status handlers with 'disconnected' type.
    return new Promise<void>((resolve) => resolve());
  };

  onEvent = <TEvent extends keyof TServerToClient>(
    event: TEvent,
    cb: (payload: TServerToClient[TEvent]) => void | Promise<void>,
  ) => {
    // TODO: Add handler to list of handlers.
  };

  offEvent = <TEvent extends keyof TServerToClient>(
    event: TEvent,
    cb: (payload: TServerToClient[TEvent]) => void | Promise<void>,
  ) => {
    // TODO: Remove handler from list of handlers.
  };

  send = <TEvent extends keyof TClientToServer>(
    event: TEvent,
    payload: TClientToServer[TEvent],
  ) => {
    // TODO: Use the this._server and send them an event.
  };

  sendAndWait = <
    TSendEvent extends keyof TClientToServer,
    TReceiveEvent extends keyof TServerToClient,
  >(
    sendEvent: TSendEvent,
    receiveEvent: TReceiveEvent,
    sendPayload: TClientToServer[TSendEvent],
    options?: SendAndWaitOptions,
  ) => {
    // TODO: Use the this._server and send them an event.
    // Wait for the proper response before returning the response payload.
  };

  onStatusChange = (
    cb: (status: ConnectedStatus | DisconnectedStatus) => void | Promise<void>,
  ) => {
    // TODO: Add handler to list of handlers.
  };

  offStatusChange = (
    cb: (status: ConnectedStatus | DisconnectedStatus) => void | Promise<void>,
  ) => {
    // TODO: Remove handler from list of handlers.
  };

  onError = (cb: (error: ErrorBase) => void | Promise<void>) => {
    // TODO: Add handler to list of handlers.
  };

  offError = (cb: (error: ErrorBase) => void | Promise<void>) => {
    // TODO: Remove handler from list of handlers.
  };
}
