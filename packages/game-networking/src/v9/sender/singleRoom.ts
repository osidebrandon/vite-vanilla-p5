import { Sender } from "./type";

export const createSingleRoomSender = <
  TSendEvents extends Record<string, object>,
>(): Sender<TSendEvents> => {
  return {
    toOwner: <TName extends keyof TSendEvents>(
      event: TName,
      payload: TSendEvents[TName],
    ) => {},
    toClient: <TName extends keyof TSendEvents>(
      userId: string,
      event: TName,
      payload: TSendEvents[TName],
    ) => {},
    toOthers: <TName extends keyof TSendEvents>(
      event: TName,
      payload: TSendEvents[TName],
    ) => {},
    toAll: <TName extends keyof TSendEvents>(
      event: TName,
      payload: TSendEvents[TName],
    ) => {},
  };
};
