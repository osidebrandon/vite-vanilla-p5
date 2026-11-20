import { IConnector } from "./IConnector";
import { IErrorListener } from "./IErrorListener";
import { IEventListener } from "../../shared/IEventListener";
import { ISender } from "./ISender";
import { IStatusListener } from "./IStatusListener";
import { EventMapBase } from "../../shared/types";

export interface ITransportClient<
  TClientToServer extends EventMapBase,
  TServerToClient extends EventMapBase,
>
  extends
    IConnector,
    IEventListener<TServerToClient>,
    ISender<TClientToServer, TServerToClient>,
    IStatusListener,
    IErrorListener {}
