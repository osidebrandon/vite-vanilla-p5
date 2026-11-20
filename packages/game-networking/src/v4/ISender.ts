export interface ISender {
  toOwner: () => void;
  toPlayer: () => void;
  toOthers: () => void;
  broadcast: () => void;
}
