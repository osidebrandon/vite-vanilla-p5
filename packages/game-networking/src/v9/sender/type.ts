export type Sender<TSendEvents extends Record<string, object>> = {
  toOwner: <TName extends keyof TSendEvents>(
    event: TName,
    payload: TSendEvents[TName],
  ) => void;
  toClient: <TName extends keyof TSendEvents>(
    userId: string,
    event: TName,
    payload: TSendEvents[TName],
  ) => void;
  toOthers: <TName extends keyof TSendEvents>(
    event: TName,
    payload: TSendEvents[TName],
  ) => void;
  toAll: <TName extends keyof TSendEvents>(
    event: TName,
    payload: TSendEvents[TName],
  ) => void;
};
