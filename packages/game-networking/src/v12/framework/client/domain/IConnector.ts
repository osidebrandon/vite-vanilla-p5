export type ConnectOptions = {
  timeoutMs?: number;
};
export interface IConnector {
  connect: (options?: ConnectOptions) => Promise<void>;
  disconnect: () => Promise<void>;
}
