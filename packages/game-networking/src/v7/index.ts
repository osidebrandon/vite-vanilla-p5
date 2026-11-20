import { createServer } from "http";
import { Server } from "socket.io";
import { basicLifecycle } from "@lifecycles";

// === FRAMEWORK === //

type HandlerMap<TEvents extends Record<string, unknown>> = {
  [TName in keyof TEvents]: (payload: TEvents[TName]) => void;
};

type Sender<TSendEvents extends Record<string, object>> = {
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

type FrameworkEvents<TPlayerForm> = {
  "game:join": { gameId: string; form: TPlayerForm };
  "game:leave": void;
};

const frameworkHandlers: HandlerMap<FrameworkEvents<TPlayerForm>> = {
  "game:join": ({ gameId }) => {
    // TODO
  },
  "game:leave": () => {
    // TODO
  },
};

type ConsumerFrameworkHandlerContext<
  TSendEvents extends Record<string, object>,
> = {
  sender: Sender<TSendEvents>;
};

type ConsumerFrameworkHandlers<TPlayerForm> = {
  handlePlayerJoin: (
    playerId: string,
    form: TPlayerForm,
    context: ConsumerFrameworkHandlerContext,
  ) => boolean;
  handlePlayerLeave: () => void;
};

// === CONSUMER === //

type MyPlayerForm = {
  username: string;
  color: string;
};

const PORT = 3001;
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const connectionHandlers: ConsumerFrameworkHandlers<MyPlayerForm> = {
  handlePlayerJoin: (playerId: string, form: MyPlayerForm, { sender }) => {
    const found = playerManager.getPlayer(playerId);
    if (found) {
      sender.toOwner("Player already in a game");
      return false;
    }

    return true;
  },
  handlePlayerLeave: () => {
    throw new Error("Function not implemented.");
  },
};

basicLifecycle({
  onStart: () => {
    httpServer.listen(PORT, () => {
      console.log(`Server running: localhost:${PORT}`);
    });
  },
  onStop: () => {
    httpServer.close();
  },
});
