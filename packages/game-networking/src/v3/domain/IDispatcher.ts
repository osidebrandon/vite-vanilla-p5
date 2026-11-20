export interface IDispatcher<TEvents extends object> {
  joinGame: () => boolean;
  leaveGame: () => void;

  //
  // *** Not sure how to dispatch custom events yet ***
  //
  // publish: <TName extends keyof TEvents>(
  //   name: TName,
  //   payload: TEvents[TName],
  // ) => void;
}
