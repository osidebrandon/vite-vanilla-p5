export interface ISender {
  toOwner: () => void;
  toPlayer: () => void;
  toOthers: () => void;
  broadcast: () => void;
}

type FrameworkContext = {
  sender: ISender;
};

type FrameworkHandlers = {
  joinGame: (payload: JoinGamePayload, context: FrameworkContext) => boolean;
  leaveGame: (payload: LeaveGamePayload, context: FrameworkContext) => void;
};

type JoinGamePayload = {
  playerId: string;
  gameId: string;
};

type LeaveGamePayload = {
  playerId: string;
  gameId: string;
};

export class Framework {
  constructor(
    private readonly handlers: FrameworkHandlers,
    private readonly connectionRegistry: IConnectionRegistry,
    private readonly createSender: (payload: JoinGamePayload) => ISender,
  ) {}

  joinGame = (payload: JoinGamePayload) => {
    //
    // TODO
    //
    const sender = this.createSender(payload);
    const context = { sender };
    const success = this.handlers.joinGame(payload, context);
  };

  leaveGame = (payload: LeaveGamePayload) => {
    //
    // TODO
    //
  };

  // TODO: Handle emitted events.
}
