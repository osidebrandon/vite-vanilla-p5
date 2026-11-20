export type ClientToServerEvents = {
  "join-game": { playerId: string };
  "leave-game": { playerId: string };
};
