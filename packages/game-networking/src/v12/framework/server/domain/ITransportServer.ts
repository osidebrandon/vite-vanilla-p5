import { IEventListener } from "../../shared/IEventListener";
import { EventMapBase } from "../../shared/types";
import { ILifecycle } from "./ILifecycle";
import { ISender } from "./ISender";

export interface ITransportServer<
  TClientToServer extends EventMapBase,
  TServerToClient extends EventMapBase,
>
  extends
    ILifecycle,
    IEventListener<TClientToServer>,
    ISender<TServerToClient> {}
