export type ConnectedStatus = {
  status: "connecting" | "connected" | "reconnecting";
};

export type DisconnectedStatus = {
  status: "disconnected";
  reason: "client" | "server" | "transport" | "unknown";
};

export interface IStatusListener {
  onStatusChange: (
    cb: (status: ConnectedStatus | DisconnectedStatus) => void | Promise<void>,
  ) => () => void;

  offStatusChange: (
    cb: (status: ConnectedStatus | DisconnectedStatus) => void | Promise<void>,
  ) => void;
}
